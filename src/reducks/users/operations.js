import { signInAction, signOutAction, fetchProductsInCartAction, fetchOrdersHistoryAction } from "./actions";
import { push } from "connected-react-router";
import { auth, FirebaseTimestamp, db} from "../../firebase/index";

export const fetchOrdersHistory = () => {
    return async (dispatch, getState) => {
        const uid = getState().users.uid;
        const list = [];

        db.collection('users').doc(uid).collection('orders')
            .orderBy('updated_at', 'desc').get()
            .then(snapshots => {
                snapshots.forEach(snapshot => {
                    const data = snapshot.data();
                    list.push(data)
                })

                dispatch(fetchOrdersHistoryAction(list))
            })
    }
}

export const addProductToCart = (addedProduct) => {
    return async (dispatch, getState) => {
        const uid = getState().users.uid;
        const cartRef = db.collection('users').doc(uid).collection('cart').doc();
        addedProduct['cartId'] = cartRef.id;
        await cartRef.set(addedProduct)
        dispatch(push('/'))
    }
}

export const fetchProductsInCart = (products) => {
    return async (dispatch) => {
        dispatch(fetchProductsInCartAction(products))
    }
}



export const listenAuthState = () => {
    return async (dispatch) => {
        return auth.onAuthStateChanged(user => {
            if (user) {
                const uid = user.uid;
        
                db.collection('users').doc(uid).get()
                    .then(snapshot => {
                        const data = snapshot.data();
        
                        dispatch(signInAction({
                            isSignedIn: true,  
                            role: data.role,
                            uid: uid,
                            username: data.username
                        }));
                    });
        
            } else {
                dispatch(push('/signin'));
            }
        });
        
    }
}

export const resetPassword = (email) => {
    return async (dispatch) => {
        if (email === '') {
            alert("必須項目が未入力です")
            return false
        }else {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('入力されたアドレスにパスワードリセット用のメールをお送りしました')
                    dispatch(push('/signin'))
                }).catch(() => {
                    alert('パスワードリセットに失敗しました')
                })
        }
    }
}

export const signIn = (email, password) => {
    return async (dispatch) => {
        if (email === "" || password === "") {
            alert("必須項目が未入力です")
            return false
        }

        return auth.signInWithEmailAndPassword(email, password)
            .then(result => {
                const user = result.user
                
                if (user) {
                    const uid = user.uid

                    db.collection('users').doc(uid).get()
                        .then(snapshot => {
                            const data = snapshot.data()

                            dispatch(signInAction({
                                isSignedIn: true,
                                role: data.role,
                                uid: uid,
                                username: data.username
                            }))
                            
                            dispatch(push('/'))
                            
                        })

                    
                }
            })
    }
}

export const signUp = (username, email, password, confirmPassword) => {
    return async (dispatch) => {
        if (username === "" || email === "" || password === "" || confirmPassword === "") {
            alert("必須項目が未入力です")
            return false
        }

        if (password !== confirmPassword) {
            alert("パスワードが一致しません")
            return false
        }

        return auth.createUserWithEmailAndPassword(email, password)
            .then(result => {
            const user = result.user

            if (user) {
                const uid = user.uid
                const timestamp = FirebaseTimestamp.now()

                const userInitialData = {
                    created_at: timestamp,
                    email: email,
                    role: "customer",
                    uid: uid,
                    updated_at: timestamp,
                    username: username
                }
                db.collection('users').doc(uid).set(userInitialData)
                    .then(() => {
                        dispatch(push('/'))
                    })
            }
        })
    }

}
export const signOut = () => {
    return async (dispatch) => {
        auth.signOut().then(() => {
            dispatch(signOutAction())
            dispatch(push('/signin'))
        })
    }
}
 
