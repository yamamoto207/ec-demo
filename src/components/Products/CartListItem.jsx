import React from "react";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/styles";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { db } from "../../firebase";
import { getUserId } from "../../reducks/users/selectors";

const useStyles = makeStyles({
    list: {
        height: 128
    },
    image: {
        objectFit: "cover",
        margin: 16,
        height: 96,
        width: 96
    },
    text: {
        width: "100%"
    }
});

const CartListItem = (props) => {
    const selector = useSelector((state) => state);
    const dispatch = useDispatch();
    const classes = useStyles();
    const uid = getUserId(selector);

    const image = props.product.images[0].path;
    const name = props.product.name;
    const price = props.product.price.toLocaleString();
    const size = props.product.size;

    const removeProductFromCart = (id) => {
        return db.collection("users").doc(uid).collection("cart").doc(id).delete()
    }

    return (
        <>
            <ListItem className={classes.list}>
                <ListItemAvatar>
                    <img className={classes.image} src={image} alt="商品のTOP画像" />
                </ListItemAvatar>
                <div className={classes.text}>
                    <ListItemText
                        primary={name}
                        secondary={"サイズ：" + size}
                    />
                    <ListItemText
                        primary={"¥" + price}
                    />
                </div>
                <IconButton onClick={() => removeProductFromCart(props.product.cartId)}>
                    <DeleteIcon />
                </IconButton>
            </ListItem>
            <Divider />
        </>
    );
}

export default CartListItem;
