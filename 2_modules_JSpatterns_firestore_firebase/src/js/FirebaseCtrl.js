// 
// Firebase Controller
// 
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import FirebaseConfig from './FirebaseConfig';
import regeneratorRuntime from "regenerator-runtime";
// 
const FirebaseCtrl = (function(FirebaseConfig) {
    // Store reference to firebase auth and firestore
    let auth, db;
    // Initialize firebase app
    const firebaseInit = function() {
        // Initialize Firebase
        firebase.initializeApp(FirebaseConfig.config);
        auth = firebase.auth();
        db = firebase.firestore();
    }
    const signUp = async function(currToday, email, pass, user) {
        return await auth.createUserWithEmailAndPassword(email, pass)
        .then(credentials => {
            db.collection('tasks').doc(credentials.user.uid)
            .collection('ongoing').doc(credentials.user.uid)
            .set({ [currToday]: [] });
            db.collection('tasks').doc(credentials.user.uid)
            .collection('completed').doc(credentials.user.uid)
            .set({ [currToday]: [] });
            return db.collection('users').doc(credentials.user.uid).set({
                name: user.name,
                avatar: user.avatar,
                theme: user.theme,
                toast: user.toast
            });
        });
    }
    const logIn = async function(email, pass) {
        return await auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
            .then(function() {
                return auth.signInWithEmailAndPassword(email, pass);
            });
        // return await auth.signInWithEmailAndPassword(email, pass);
    }
    const logOut = async function() {
        return await auth.signOut();
    }
    const reauthenticate = async function(email, password) {
        const cred = firebase.auth.EmailAuthProvider.credential( email, password );
        return await auth.currentUser.reauthenticateWithCredential(cred);
    }
    const tasksOnSnapshot = async function(collection) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid)
        .collection(collection).doc(user.uid)
        .get();
    }
    const setTask = async function(currToday, task) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid)
        .collection('ongoing').doc(user.uid)
        .set({ [currToday]: [task] })
        .then(() => {
            return db.collection('tasks').doc(user.uid)
            .collection('completed').doc(user.uid)
            .set({ [currToday]: [] });
        });
    }
    const updateSingleTask = async function(currToday, task) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid).collection('ongoing').doc(user.uid).update({ [currToday]: firebase.firestore.FieldValue.arrayUnion(task) });
    }
    const updateAllOngoingTasks = async function(currToday, tasks) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid).collection('ongoing').doc(user.uid).update({ [currToday]: tasks });
    }
    const updateAllCompletedTasks = async function(currToday, tasks) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid).collection('completed').doc(user.uid).update({ [currToday]: tasks });
    }
    const deleteSingleTask = async function(currToday, updatedTasks, collection) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid).collection(collection).doc(user.uid)
        .update({ [currToday]: updatedTasks });
    }
    const deleteAllTasks = async function(currToday, collection) {
        const user = auth.currentUser;
        return await db.collection('tasks').doc(user.uid).collection(collection).doc(user.uid).update({ [currToday]: firebase.firestore.FieldValue.delete() });
    }
    const markAs = async function(currToday, updatedTasks, changedTasks, collections, singleTask = true) {
        const user = auth.currentUser;
        // Delete from ongoing / completed collection
        return await db.collection('tasks').doc(user.uid).collection(collections[0]).doc(user.uid).update({ [currToday]: updatedTasks })
        // add to completed / ongoing collection
        .then(() => {
            if(singleTask) {
                return db.collection('tasks').doc(user.uid).collection(collections[1]).doc(user.uid).update({ [currToday]: firebase.firestore.FieldValue.arrayUnion(changedTasks) });
            } else {
                return db.collection('tasks').doc(user.uid).collection(collections[1]).doc(user.uid).update({ [currToday]: changedTasks });
            }
        });
    }
    const addTask = async function(data) {
        // Unpack data
        const { currToday, task } = data;
        // Check if user is logged in
        const user = auth.currentUser;
        if (user) {
            return await db.collection('tasks').doc(user.uid)
            .collection('ongoing').doc(user.uid)
            .get()
            .then(doc => {
                if (!doc.exists) {
                    // Set a new firestore document for a user and add task to it
                    return setTask(currToday, task);
                } else {
                    if(doc.get(currToday) != null) {
                        // check if field value already exists
                        if (!doc.data()[currToday].includes(task)) {
                            // Update firestore document for a user
                            return updateSingleTask(currToday, task);
                        } else {
                            // Do not allow duplicates
                            throw new Error(`${task} has already been added`);
                        }
                    } else {
                        // Set a new firestore field and add task to it
                        return updateSingleTask(currToday, task);
                    }
                }
            })
            .then(() => {
                // Grab updated docs
                return tasksOnSnapshot('ongoing');
            });
        }
    }
    const getUserDoc = async function(user) {
        return await db.collection('users').doc(user.uid).get();
    }
    const updateUser = async function(user, key, value) {
        return await db.collection('users').doc(user.uid).update({
            [key]: value
        });
    }
    const deleteUser = async function() {
        const user = auth.currentUser;
        return await deleteUserTasks(user)
        .then(() => deleteUserCollection(user))
        .then(() => user.delete());
    }
    const deleteUserCollection = async function(user) {
        return await db.collection('users').doc(user.uid).delete();
    }
    const deleteUserTasks = async function(user) {
        return await db.collection('tasks').doc(user.uid).
        collection('completed').doc(user.uid).delete()
        .then(() => db.collection('tasks').doc(user.uid).
        collection('ongoing').doc(user.uid).delete());
    }
    const authStatus = function(data) {
        // Unpack data
        const { setUI, renderDayModeCalendar, currToday, setOngoingTasks, setCompletedTasks } = data;
        auth.onAuthStateChanged(user => {
            // User logged in
            if (user) {
                // Get ongoing tasks
                tasksOnSnapshot('ongoing')
                .then(snapshot => {
                    // Set ongoing tasks
                    setOngoingTasks(snapshot.data());
                    // Render day mode
                    renderDayModeCalendar(currToday, setOngoingTasks, snapshot.data(), updateAllOngoingTasks);
                    // Get completed tasks
                    return tasksOnSnapshot('completed');
                })
                .then(snapshot => {
                    // Set completed tasks
                    setCompletedTasks(snapshot.data());
                    // Get user document
                    return getUserDoc(user);
                })
                .then(snapshot => {
                    // Adjust UI display
                    setUI(user, {
                        info: snapshot.data(),
                        date: new Date()
                    });
                })
                .catch(error => {
                    // Handle errors
                    setUI(undefined, {
                        error
                    });
                });
            // User logged out
            } else {
                // Adjust UI display
                setUI(user);
            }
        });
    }
    return {
        firebaseInit,
        signUp,
        logOut,
        logIn,
        reauthenticate,
        tasksOnSnapshot,
        setTask,
        updateSingleTask,
        updateAllOngoingTasks,
        updateAllCompletedTasks,
        deleteSingleTask,
        deleteAllTasks,
        markAs,
        addTask,
        updateUser,
        deleteUser,
        authStatus
    }
})(FirebaseConfig);
export default FirebaseCtrl;