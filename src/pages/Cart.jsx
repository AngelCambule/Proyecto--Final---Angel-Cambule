import React, { useContext } from "react";
import { collection, getDoc, doc, getFirestore } from "firebase/firestore";
import { CartContext } from "../Context/CartContext";
import { CartPaymentDetails } from "../Components/CartPaymentDetails";
import { Loader } from "../Components/Loader";
import { useNavigate } from "react-router-dom";
import CartDetail from "../Components/CartDetail";
import styles from '../Components/styles.module.css'

const fetchProductsByIds = async (ids) => {
  const db = getFirestore();
  const productRefs = ids.map((id) => doc(collection(db, "products"), id));

  const productSnapshots = await Promise.all(
    productRefs.map((productRef) => getDoc(productRef))
  );

  const products = productSnapshots.map((productSnapshot) => {
    if (productSnapshot.exists()) {
      return { id: productSnapshot.id, ...productSnapshot.data() };
    } else {
      return null;
    }
  });

  return products.filter((product) => product !== null);
};

const Cart = () => {
  const [error, setError] = React.useState(false);
  const [productsData, setProductsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const { count } = useContext(CartContext);
  React.useEffect(() => {
    const ids = count.products.map((product) => product.productId);
    fetchProductsByIds(ids)
      .then((res) => setProductsData(res))
      .catch((err) => setError(err))
      .then(() => setLoading(false));
  }, [count.products]);

  const findQtyByProductId = (productId) => {
    const item = count.products.find(
      (item) => item.productId === productId
    );
    return item ? item.qty : 0;
  };

  const total = productsData
    .map((product) => product.precio * findQtyByProductId(product.id))
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);


  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    navigate("/checkout", { state: total });
  };

  console.log(count)
  return loading ? (
    <Loader />
  ) : (
    <div style={{paddingTop:"100px"}}>
        
    <div className={styles.cartContainer}>
      <div className={styles.cartItems}>
        
        {productsData.map((product) => (
          <div>
             <CartDetail
            key={product.id}
            product={product}
            qty={count.products.find(
              (p) => p.productId === product.id
            )}
          />
          </div>
          
        ))}
        
      </div>
      <div style={{}}>
        <CartPaymentDetails  total={total} onClick={handleCheckoutClick} />
      </div>
    </div>
    </div>
  );
};

export default Cart