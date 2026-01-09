type Props = {
  itemCount: number;
};

const CartPageHeader = ({ itemCount }: Props) => (
  <section className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
    <div className="container-wide py-10 md:py-12">
      <span className="section-subtitle">Shopping</span>
      <h1 className="section-title mt-2">Your Cart</h1>
      <p className="text-stone-500 dark:text-stone-400 mt-2">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </p>
    </div>
  </section>
);

export default CartPageHeader;
