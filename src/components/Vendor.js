import React from 'react';
import { Scaler } from "dapparatus";
import Blockies from 'react-blockies';
import Ruler from "./Ruler";
import {CopyToClipboard} from "react-copy-to-clipboard";
const QRCode = require('qrcode.react');

let interval

export default class Advanced extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }
  componentDidMount(){
    interval = setInterval(this.poll.bind(this),3000)
    setTimeout(this.poll.bind(this),444)
  }
  componentWillUnmount(){
    clearInterval(interval)
  }
  async poll(){
    let id = 0
    let products = []//this.state.products
    if(!products){
      products = []
    }

    let found = true
    while(found){
      let nextProduct = await this.props.contracts.DenDai.products(this.props.address,id).call()
      if(nextProduct.exists){
        products[id++] = nextProduct
      }else{
        found=false
      }
    }
    console.log("========PPPPPP",products)
    this.setState({products})
  }
  render(){
    let {mainStyle,contracts,vendor,tx,web3} = this.props

    let products = []
    for(let p in this.state.products){
      let prod = this.state.products[p]
      if(prod.exists){

        let available = (
          <i class="far fa-eye"></i>
        )
        if(!prod.isAvailable){
          available = (
            <i class="far fa-eye" style={{opacity:0.3}}></i>
          )
        }

        products.push(
          <div className="content bridge row">
          <div className="col-1 p-1">
            {available}
          </div>
            <div className="col-6 p-1">
              {web3.utils.hexToUtf8(prod.name)}
            </div>
            <div className="col-5 p-1">
              {web3.utils.fromWei(prod.cost,'ether')}
            </div>
          </div>
        )
      }
    }

    return (
      <div className="main-card card w-100">
        <div className="content bridge row">
          <div className="col-12 p-1" style={{textAlign:'center'}}>
            <h2>{web3.utils.hexToUtf8(vendor.name)}</h2>
          </div>
        </div>
        {products}
        <div className="content bridge row">
          <div className="col-4 p-1">
            <input type="text" className="form-control" placeholder="Name..." value={this.state.newProductName}
                   onChange={event => this.setState({newProductName:event.target.value})} />
          </div>
          <div className="col-4 p-1">
          <div className="input-group">
            <div className="input-group-prepend">
              <div className="input-group-text">$</div>
            </div>
            <input type="text" className="form-control" placeholder="0.00" value={this.state.newProductAmount}
              onChange={event => this.setState({newProductAmount:event.target.value})} />
          </div>
          </div>
          <div className="col-4 p-1">
          <button className="btn btn-large w-100" style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}} onClick={()=>{
            //addProduct(uint256 id, bytes32 name, uint256 cost, bool isAvailable)
            let nextId = this.state.products.length
            tx(contracts.DenDai.addProduct(nextId,web3.utils.utf8ToHex(this.state.newProductName),web3.utils.toWei(""+this.state.newProductAmount, 'ether'),true),120000,0,0,(result)=>{
              console.log("PRODUCT ADDED",result)
              this.setState({newProductAmount:"",newProductName:""})
              setTimeout(this.poll.bind(this),100)
            })
          }}>
            <Scaler config={{startZoomAt:500,origin:"40% 50%"}}>
              <i className="fas fa-plus-square"></i> Add Product
            </Scaler>
          </button>
          </div>
        </div>
      </div>
    )
  }
}
