import React, {Component} from 'react';
import axios from 'axios';
import { Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import './shopPage.css';
import NavbarForSite from './navbar';
import ShopNameContainer from './shopNameContainer';
import MenuItems from './menuItems';
import Footer from './footer';


class ShopPage extends Component{

    constructor(props) {
        super(props);

        this.state = { userEmail: '', loggedIn: true, showModal: false, shopName: '', shopAddress: '', noOfTables: 1,
                      shopList: [], menuItemList: [], shopIdVar: "", suggestions: [], item: '', itemNameAsObjectArr: [], itemNameList: [], showNewItemAddModal: false, itemName: '', vegOrNonVeg: '',  itemPrice: 0, itemDescription: '', itemCategory: '', showSearchBar: 'none', showItemEditModal: false, editItemName: '', editVegOrNonVeg: '', editItemPrice: '', editItemDescription: '', editItemCategory: '', editItemId: ''}

        this.showShopAddModal = this.showShopAddModal.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.showShopAfterAdding = this.showShopAfterAdding.bind(this);
        this.shopList = this.shopList.bind(this);
        this.menuItemList = this.menuItemList.bind(this);
        this.getMenuFunction = this.getMenuFunction.bind(this);
        this.deleteItemFunction = this.deleteItemFunction.bind(this);
    }

    showShopAddModal() {
        this.setState({
            showModal: !this.state.showModal
        })
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onTextChanged = (e) => {
        const value = e.target.value;
        let suggestions = [];
        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, 'i');
            suggestions = this.state.itemNameList.sort().filter(v => regex.test(v));
        }
        this.setState(() => ({ suggestions, item: value }));
    }

    suggestionSelected = (value) => {
        this.setState({item: value, suggestions: []});

        var itemObj = this.state.menuItemList.filter(item => item.itemName === value)

        this.setState({
            editItemName: itemObj[0].itemName,
            editVegOrNonVeg: itemObj[0].vegOrNonVeg,
            editItemPrice: itemObj[0].price,
            editItemDescription: itemObj[0].description,
            editItemCategory: itemObj[0].category,
            editItemId: itemObj[0]._id,
            showItemEditModal: !this.showItemEditModal
        });

    }

    renderSuggestions = () => {
        if(this.state.suggestions.length === 0) {
            return null;
        }
        return (
            <ul>
                {this.state.suggestions.map((item) => <li onClick = {() => this.suggestionSelected(item)} key={item}>{item}</li>)}
            </ul>
        );
    }

    onSubmit() {
        this.setState({showModal: !this.state.showModal})

        axios.put('http://localhost:5000/shop', {
            userEmail: this.state.userEmail,
            shopName: this.state.shopName,
            shopAddress: this.state.shopAddress,
            noOfTables: this.state.noOfTables
        })
        .then(res => {
            console.log(res.data);
            this.showShopAfterAdding();
        })

    }

    addNewItemToMenuFunction = () => {

        this.setState({showNewItemAddModal: !this.state.showNewItemAddModal})

        axios.put('http://localhost:5000/menu', {
            shopId: this.state.shopIdVar,
            itemName: this.state.itemName,
            vegOrNonVeg: this.state.vegOrNonVeg,
            price: this.state.itemPrice,
            description: this.state.itemDescription,
            category: this.state.itemCategory
        })
        .then(res => {
            console.log(res.data);
            this.getMenuFunction(this.state.shopIdVar);
        })
    }

    showShopAfterAdding() {
        axios.get(`http://localhost:5000/shop/get_shops/${this.state.userEmail}`)
            .then(res => {
                //console.log(res.data[0].shop);
                this.setState({shopList: res.data[0].shop})
            })
    }

    componentDidUpdate(prevProps, prevState) {
        try{
            if(!prevState.userName) {
                this.setState({userName: this.props.user.userName,
                              userEmail: this.props.user.userEmail})
                axios.get(`http://localhost:5000/shop/get_shops/${this.state.userEmail}`)
                    .then(res => {
                        //console.log(res.data[0].shop);
                        this.setState({shopList: res.data[0].shop})
                    })
            }
        } catch(err) {
            this.setState({loggedIn: false})
        }
    }

    getMenuFunction(shopId) {
        this.setState({shopIdVar: shopId});
        axios.get(`http://localhost:5000/menu/${shopId}`)
        .then(res => {
            //console.log(res.data[0].menu)
            this.setState({menuItemList: res.data[0].menu})
        })

        axios.get(`http://localhost:5000/items_name/for-autoComplete/${shopId}`)
        .then(res => {
            this.setState({itemNameAsObjectArr: res.data})
            var arr = [];
            //console.log(this.state.productSuggestions[0].productName)
            for(var i=0; i<this.state.itemNameAsObjectArr.length; i++) {
                arr[i] = this.state.itemNameAsObjectArr[i].itemName
            }
            this.setState({itemNameList: arr})
        })

    }

    deleteItemFunction(itemIdAttribute) {
        axios.put('http://localhost:5000/menu/item/delete/', {
                shopId: this.state.shopIdVar,
                itemId: itemIdAttribute
            })
        .then(res => {
            console.log(res.data);
            //this.props.loadComponentAgain();

        })
    }

    shopList = () => {
        const list = this.state.shopList.map((shop) =>
            <div key={shop._id}>
                <ShopNameContainer shopName={shop.shopName} menuForShop={this.getMenuFunction} shopId={shop._id} showSearchBar={this.showSearchBarFunction}/>
            </div>
        );

        return (list);
    }

    menuItemList = () => {
        const list = this.state.menuItemList.map((menuItem) =>
            <div key={menuItem._id}>
                <MenuItems itemName={menuItem.itemName} vegOrNonVeg={menuItem.vegOrNonVeg} price={menuItem.price} description={menuItem.description} category={menuItem.category} deleteItemFromMenu={this.deleteItemFunction}
                itemId={menuItem._id} shopId={this.state.shopIdVar} menuReload={this.getMenuFunction}/>
            </div>
        );

        return (list);
    }

    showSearchBarFunction = () => {
        this.setState({showSearchBar: 'inline-block'})
    }

    editItemDetails = () => {
        this.setState({showItemEditModal: !this.state.showItemEditModal});
        axios.put('http://localhost:5000/menu/item_update', {
            shopId: this.state.shopIdVar,
            menuItemId: this.state.editItemId,
            itemName: this.state.editItemName,
            vegOrNonVeg: this.state.editVegOrNonVeg,
            price: this.state.editItemPrice,
            description: this.state.editItemDescription,
            category: this.state.editItemCategory
            })
        .then(res => {
            console.log(res.data);
            this.getMenuFunction(this.state.shopIdVar);
            //this.props.loadComponentAgain();

        })
    }

    render() {
        if(!this.state.loggedIn) {
            return <Redirect to='/' />;
        }

        return (
            <div className="parent-div">
                <NavbarForSite />
                <div className="main-container row">
                    <div className="col-md-4 retaurant-col">
                        <Button variant="danger" className="add-restaurant-button" onClick={() => {this.showShopAddModal()}}>Add Restaurant</Button>

                        <div className="restaurant-list">
                            <h3 className="col-heading">Restaurants</h3>
                            {this.shopList()}
                        </div>
                    </div>
                    <div className="col-md-8 menu-col">

                        <div className="searchBar-div" style={{display: this.state.showSearchBar}}>
                            <InputGroup className="searchBar">
                                <InputGroup.Prepend>
                                  <InputGroup.Text ><span role="img" aria-label="search"><i class="fas fa-search"></i></span></InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    placeholder="What can we help you find?"
                                    aria-label="What can we help you find"
                                    onChange={this.onTextChanged}
                                    type='text'
                                    value={this.state.item}
                                />
                            </InputGroup>
                            <button className="add-new-item-btn" onClick={() => {this.setState({showNewItemAddModal: !this.state.showNewItemAddModal})}}>
                              Add New Item
                            </button>
                            
                            <div className="mb-3 suggestion">
                                {this.renderSuggestions()}
                            </div>
                        </div>


                        <div className="div-to-show-menu">
                            {this.menuItemList()}
                        </div>
                    </div>
                </div>

                <div id="footer">
                    <Footer />
                </div>

                <div>
                    <Modal
                        size="md"
                        aria-labelledby="item-edit-modal"
                        centered
                        show={this.state.showItemEditModal}
                        onHide={() => { this.setState({showItemEditModal: !this.state.showItemEditModal}) }}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    ADD NEW ITEM DETAILS
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Item Name</Form.Label>
                                        <Form.Control type="text" placeholder="Item Name" name='editItemName' value={this.state.editItemName} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Veg/Non-Veg</Form.Label>
                                        <Form.Control type="text" placeholder="Veg/Non-Veg" name='editVegOrNonVeg' value={this.state.editVegOrNonVeg} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control type="number" placeholder="Item Price" name='editItemPrice' value={this.state.editItemPrice} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control type="text" placeholder="One Line description of item" name='editItemDescription' value={this.state.editItemDescription} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Item Category</Form.Label>
                                        <Form.Control type="text" placeholder="Item Category like main course, starter ..." name='editItemCategory' value={this.state.editItemCategory} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Button variant="primary" onClick={this.editItemDetails}>
                                        Submit
                                    </Button>
                                </Form>

                            </Modal.Body>
                        </Modal>
                </div>

                <div>
                    <Modal
                        size="md"
                        aria-labelledby="new-item-add-modal"
                        centered
                        show={this.state.showNewItemAddModal}
                        onHide={() => { this.setState({showNewItemAddModal: !this.state.showNewItemAddModal}) }}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    ADD NEW ITEM DETAILS
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Item Name</Form.Label>
                                        <Form.Control type="text" placeholder="Item Name" name='itemName' value={this.state.itemName} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Veg/Non-Veg</Form.Label>
                                        <Form.Control type="text" placeholder="Veg/Non-Veg" name='vegOrNonVeg' value={this.state.vegOrNonVeg} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control type="number" placeholder="Item Price" name='itemPrice' value={this.state.itemPrice} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control type="text" placeholder="One Line description of item" name='itemDescription' value={this.state.itemDescription} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Item Category</Form.Label>
                                        <Form.Control type="text" placeholder="Item Category like main course, starter ..." name='itemCategory' value={this.state.itemCategory} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Button variant="primary" onClick={this.addNewItemToMenuFunction}>
                                        Submit
                                    </Button>
                                </Form>

                            </Modal.Body>
                        </Modal>
                </div>

                <div>
                    <Modal
                        size="md"
                        aria-labelledby="shop-add-modal"
                        centered
                        show={this.state.showModal}
                        onHide={this.showShopAddModal}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    SHOP DETAILS
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={this.handleSubmit}>

                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>Shop Name</Form.Label>
                                        <Form.Control type="text" placeholder="Shop Name" name='shopName' value={this.state.shopName} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control as="textarea" rows="3" placeholder="Address" name='shopAddress' className="address-text-area" value={this.state.shopAddress} onChange={this.handleInputChange}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Number Of Table</Form.Label>
                                        <Form.Control type="number" placeholder="Number Of Tables" min="1" name='noOfTables' value={this.state.noOfTable} onChange={this.handleInputChange}/>
                                    </Form.Group>
                                    <Button variant="primary" onClick={this.onSubmit} className="sign-up-button">
                                        Submit
                                    </Button>
                                </Form>

                            </Modal.Body>
                        </Modal>
                </div>


            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.auth
    }
}

export default connect(mapStateToProps)(ShopPage);
