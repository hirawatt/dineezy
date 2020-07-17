import React, {Component} from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
//import { addItem, deleteItem } from '../store/actions/itemActions';
import './showMenu.css';
import NavbarForSite from './navbar';
import ItemCard from './itemCard';
import ItemsInCart from './itemsInCart';


class ShowMenu extends Component{

    constructor(props) {
        super(props);

        this.state = { category: [], itemsByCategory: [], visibility: "hidden", transform: "translateX(100)", itemsInCart: [], noOfItemsInCart: 0, totalPrice: 0 }

        this.loadCategoryFunction = this.loadCategoryFunction.bind(this);
        this.loadCategoryFunction();
        this.renderItemCategory = this.renderItemCategory.bind(this);
        this.loadItemFunction = this.loadItemFunction.bind(this);
        this.showCartSideBar = this.showCartSideBar.bind(this);
        this.closeCartSideBar = this.closeCartSideBar.bind(this);
        this.renderCartItems = this.renderCartItems.bind(this);
        console.log(this.props.items);
    }

    loadCategoryFunction() {
        axios.get(`http://localhost:5000/item_categories/${this.props.match.params.shopId}`)
        .then(res => {
            //console.log(res.data)
            this.setState({category: res.data})
        })
    }

    loadItemFunction(itemCategory) {
        axios.get(`http://localhost:5000/items?shopId=${this.props.match.params.shopId}&category=${itemCategory}`)
        .then(res => {
            //console.log(res.data)
            this.setState({itemsByCategory: res.data})
        })
    }

    renderItemCategory = () => {
        switch(this.state.category.length) {
            case 0:
                return (
                    <React.Fragment>
                        <div className="btn-div">
                            <h5>Loading</h5>
                        </div>
                    </React.Fragment>
                )
            default:
                const list = this.state.category.map((itemCategory) =>
                    <div key={itemCategory}>
                        <ul>
                            <li onClick={() => {this.loadItemFunction(itemCategory)}}>{itemCategory}</li>
                        </ul>
                    </div>
                );

        return (list);

        }
    }

    renderMenuItemList = () => {
        const list = this.state.itemsByCategory.map((menuItem) =>
            <div key={menuItem.menu._id}>
                <ItemCard itemName={menuItem.menu.itemName} vegOrNonVeg={menuItem.menu.vegOrNonVeg} price={menuItem.menu.price} description={menuItem.menu.description} itemId={menuItem.menu._id}/>
            </div>
        );

        return (list);
    }

    closeCartSideBar() {
        this.setState({
            visibility: "hidden",
            transform: "translateX(100)"
        })
    }

    showCartSideBar() {
        
        if (this.props.items) {
            var noOfItems = 0;
            var totalPrice = 0;
            
            for (var i=0; i<this.state.itemsInCart.length; i++){
                noOfItems+=this.state.itemsInCart[i].itemQuantity;
                totalPrice+=this.state.itemsInCart[i].itemQuantity * this.state.itemsInCart[i].itemPrice;
            }
            
            this.setState({
                visibility: "visible",
                transform: "translateX(0)",
                itemsInCart: this.props.items,
                noOfItemsInCart: noOfItems,
                totalPrice: totalPrice
            })
            
        } else {
            this.setState({
                visibility: "visible",
                transform: "translateX(0)"
            })
        }
    }

    renderCartItems = () => {
        const list = this.state.itemsInCart.map((cartItem) =>
            <div key={cartItem.itemName}>
                <ItemsInCart itemName={cartItem.itemName} price={cartItem.itemPrice} quantity={cartItem.itemQuantity}/>
            </div>
        );

        return (list);
    }

    render() {
        return (
            <div className="show-menu-main-div">

                <NavbarForSite/>

                <div className="menu-category row">
                    <div className="col-lg-11 col-md-10 col-sm-6 ">
                        <div className="default-list">{this.renderItemCategory()}</div>
                        <div class="dropdown category-drop">
                          <button class="btn btn-secondary dropdown-toggle category-btn" type="button" id="categorydropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Category
                          </button>
                          <div class="dropdown-menu category-list" aria-labelledby="categorydropdown">
                            <div className="small-sc-list">{this.renderItemCategory()}</div>
                          </div>
                        </div>
                    </div>
                  <div className="col-lg-1 col-md-2 col-sm-6 cart-option">
                      <span onClick={this.showCartSideBar}><i className="fas fa-cart-plus cart-icon"></i></span>
                      <span className="cart-items">{this.state.noOfItemsInCart}</span>
                  </div>
                </div>
                <div className="items-card">
                    {this.renderMenuItemList()}
                </div>

                <div className="cart-overlay transparentBcg" style={{visibility: this.state.visibility}}>
                    <div className="cart-side-bar showCart" style={{transform: this.state.transform}}>
                        <i className="back-btn fas fa-arrow-circle-left fa-2x" onClick={this.closeCartSideBar}></i>
                        <div className="item-bg">
                            {this.renderCartItems()}
                        </div>
                        <div className="cart-footer">
                            <h3>your total: ₹ {this.state.totalPrice}</h3>
                            <Button className="clear-cart">Clear cart</Button>
                        </div>

                    </div>
                </div>


            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        items: state.item.items
    }
}

export default connect(mapStateToProps)(ShowMenu);
