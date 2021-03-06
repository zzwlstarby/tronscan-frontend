/*eslint-disable */
import React, { Fragment } from "react";
import xhr from "axios/index";
import { FormattedNumber } from "react-intl";
import { Tooltip } from "reactstrap";
import { alpha } from "../../utils/str";
import { connect } from "react-redux";
import { ONE_TRX, API_URL } from "../../constants";
import Lockr from "lockr";
let PriceContext = React.createContext({
  priceBTC: 0,
  priceUSD: 0
});

let { Provider, Consumer } = PriceContext;

class PriceProviderCmp extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      prices: {
        BTC: 0,
        EUR: 0,
        USD: 0,
        TRX: 1
      },
      priceShown: props.activeCurrency || "TRX",
      currencies: {},
      activePrice: 1
    };

    for (let currency of props.currencies) {
      this.state.currencies[currency.id.toUpperCase()] = currency;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(state => ({
      priceShown: nextProps.activeCurrency,
      activePrice: state.prices[nextProps.activeCurrency.toUpperCase()]
    }));
  }

  async loadPrices() {
    var dataEur = Lockr.get("dataEur");
    var dataEth = Lockr.get("dataEth");
    let eurURL = encodeURI(
      `https://api.coinmarketcap.com/v1/ticker/tronix/?convert=EUR`
    );
    let ethURL = encodeURI(
      `https://api.coinmarketcap.com/v1/ticker/tronix/?convert=ETH`
    );
    if (!Lockr.get("dataEur")) {
      var { data: dataEur } = await xhr.get(
        `${API_URL}/api/system/proxy?url=${eurURL}`
      );
    }

    if (!Lockr.get("dataEth")) {
      var { data: dataEth } = await xhr.get(
        `${API_URL}/api/system/proxy?url=${ethURL}`
      );
    }

    let newPrices = {
      BTC: parseFloat(dataEur[0].price_btc),
      EUR: parseFloat(dataEur[0].price_eur),
      USD: parseFloat(dataEur[0].price_usd),
      ETH: parseFloat(dataEth[0].price_eth),
      TRX: 1
    };

    this.setState(state => ({
      prices: newPrices,
      activePrice: newPrices[state.priceShown.toUpperCase()]
    }));
  }

  componentDidMount() {
    this.loadPrices();
  }

  render() {
    let { children } = this.props;

    return <Provider value={this.state}>{children}</Provider>;
  }
}

function mapStateToProps(state) {
  return {
    activeCurrency: state.app.activeCurrency,
    currencies: state.app.currencyConversions
  };
}

const mapDispatchToProps = {};

export let PriceProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(PriceProviderCmp);

let oTimer = null;
export class TRXPrice extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      open: false,
      id: alpha(24),
      percent_change_24h: 0
    };
  }

  // async loadTrxPrices() {
  //   var dataEur = Lockr.get("dataEur");

  //   let eurURL = encodeURI(
  //     `https://api.coinmarketcap.com/v1/ticker/tronix/?convert=EUR`
  //   );

  //   if (!Lockr.get("dataEur")) {
  //     var { data: dataEur } = await xhr.get(
  //       `${API_URL}/api/system/proxy?url=${eurURL}`
  //     );
  //   }
  //   if (dataEur.length > 0) {
  //     let percent_change_24h = dataEur[0].percent_change_24h;
  //     this.setState({
  //       percent_change_24h
  //     });
  //   }
  // }

  componentDidMount() {
    // oTimer = setInterval(() => this.loadTrxPrices(), 10000);
  }

  componentWillUnmount() {
    clearInterval(oTimer);
  }

  renderPrice(value, priceValues) {
    let { currency = "" } = this.props;
    let id = currency || priceValues.priceShown;
    return priceValues.prices[id.toUpperCase()] * value;
  }

  render() {
    let { open, id } = this.state;
    let {
      source,
      name,
      amount = 0,
      currency = "",
      showCurreny = true,
      showPopup = true,
      priceChage = 0,
      ...props
    } = this.props;
    let ele = null;

    const myPng = src => {
      return require(`../../images/home/${src}.png`);
    };
    return (
      <Consumer>
        {priceValues => {
          switch (source) {
            case "transfers":
              ele = (
                <Fragment>
                  <FormattedNumber
                    value={this.renderPrice(amount, priceValues)}
                    maximumFractionDigits={12}
                  >
                    {value => (
                      <span
                        id={id}
                        onMouseEnter={() => this.setState({ open: true })}
                        onMouseLeave={() => this.setState({ open: false })}
                        {...props}
                      >
                        {name == "TRX" ? amount / ONE_TRX : amount} &nbsp;{" "}
                        {name}
                      </span>
                    )}
                  </FormattedNumber>
                  {showPopup && (
                    <Tooltip placement="top" isOpen={open} target={id}>
                      TRX
                      <FormattedNumber
                        value={amount / ONE_TRX}
                        maximumFractionDigits={6}
                        // minimumFractionDigits={6}
                      />
                      <br />
                      BTC
                      <FormattedNumber
                        value={priceValues.prices.BTC * (amount / ONE_TRX)}
                        maximumFractionDigits={
                          priceValues.currencies.BTC.fractions || 2
                        }
                      />
                      <br />
                      ETH
                      <FormattedNumber
                        value={priceValues.prices.ETH * (amount / ONE_TRX)}
                        maximumFractionDigits={
                          priceValues.currencies.ETH.fractions || 2
                        }
                      />
                      <br />
                      USD
                      <FormattedNumber
                        value={priceValues.prices.USD * (amount / ONE_TRX)}
                        maximumFractionDigits={
                          priceValues.currencies.USD.fractions || 3
                        }
                      />
                      <br />
                      EUR
                      <FormattedNumber
                        value={priceValues.prices.EUR * (amount / ONE_TRX)}
                        maximumFractionDigits={
                          priceValues.currencies.EUR.fractions || 2
                        }
                      />
                    </Tooltip>
                  )}
                </Fragment>
              );
              break;
            case "home":
              ele = (
                <Fragment>
                  <FormattedNumber
                    value={this.renderPrice(amount, priceValues)}
                    maximumFractionDigits={
                      priceValues.currencies[
                        currency.toUpperCase() ||
                          priceValues.priceShown.toUpperCase()
                      ].fractions || 3
                    }
                  >
                    {value => (
                      <span
                        id={id}
                        onMouseOver={() => this.setState({ open: true })}
                        onMouseOut={() => this.setState({ open: false })}
                        {...props}
                      >
                        <span className="currentTrxPirce">{value} </span>
                        <span className="currentCurrency">
                          {showCurreny &&
                            (currency.toUpperCase() ||
                              priceValues.priceShown.toUpperCase())}{" "}
                        </span>
                        <span
                          className={
                            Number(priceChage) > 0 ? "greenPrice " : "redPrice "
                          }
                          style={{ display: "inline-block" }}
                        >
                          {Number(priceChage) === 0 ? (
                            <span>({priceChage}%)</span>
                          ) : (
                            <span>
                              ({Number(priceChage) > 0 ? "+" : ""}
                              {priceChage}%){" "}
                              {Number(priceChage) > 0 ? (
                                <img
                                  className="quotesImg"
                                  src={myPng("up")}
                                  alt=""
                                />
                              ) : (
                                <img
                                  className="quotesImg"
                                  src={myPng("down")}
                                  alt=""
                                />
                              )}
                            </span>
                          )}
                        </span>
                      </span>
                    )}
                  </FormattedNumber>
                  {showPopup && (
                    <Tooltip placement="top" isOpen={open} target={id}>
                      TRX
                      <FormattedNumber
                        value={amount}
                        maximumFractionDigits={6}
                        // minimumFractionDigits={6}
                      />
                      <br />
                      <span className="text-capitalize">satoshi</span>{" "}
                      <FormattedNumber
                        value={
                          priceValues.prices.BTC * amount * Math.pow(10, 8)
                        }
                        maximumFractionDigits={
                          priceValues.currencies.BTC.fractions || 2
                        }
                      />
                      <br />
                      ETH
                      <FormattedNumber
                        value={priceValues.prices.ETH * amount}
                        maximumFractionDigits={
                          priceValues.currencies.ETH.fractions || 2
                        }
                      />
                      <br />
                      USD
                      <FormattedNumber
                        value={priceValues.prices.USD * amount}
                        maximumFractionDigits={
                          priceValues.currencies.USD.fractions || 3
                        }
                      />
                      <br />
                      EURs
                      <FormattedNumber
                        value={priceValues.prices.EUR * amount}
                        maximumFractionDigits={
                          priceValues.currencies.EUR.fractions || 6
                        }
                      />
                    </Tooltip>
                  )}
                </Fragment>
              );
              break;
            default:
              ele = (
                <Fragment>
                  <FormattedNumber
                    value={this.renderPrice(amount, priceValues)}
                    maximumFractionDigits={
                      priceValues.currencies[
                        currency.toUpperCase() ||
                          priceValues.priceShown.toUpperCase()
                      ].fractions || 2
                    }
                  >
                    {value => (
                      <span
                        id={id}
                        onMouseEnter={() => this.setState({ open: true })}
                        onMouseLeave={() => this.setState({ open: false })}
                        {...props}
                      >
                        {value}
                        &nbsp;
                        {showCurreny &&
                          (currency.toUpperCase() ||
                            priceValues.priceShown.toUpperCase())}
                      </span>
                    )}
                  </FormattedNumber>
                  {showPopup && (
                    <Tooltip placement="top" isOpen={open} target={id}>
                      TRX
                      <FormattedNumber
                        value={amount}
                        maximumFractionDigits={6}
                        // minimumFractionDigits={6}
                      />
                      <br />
                      BTC
                      <FormattedNumber
                        value={priceValues.prices.BTC * amount}
                        maximumFractionDigits={
                          priceValues.currencies.BTC.fractions || 2
                        }
                      />
                      <br />
                      ETH
                      <FormattedNumber
                        value={priceValues.prices.ETH * amount}
                        maximumFractionDigits={
                          priceValues.currencies.ETH.fractions || 2
                        }
                      />
                      <br />
                      USD
                      <FormattedNumber
                        value={priceValues.prices.USD * amount}
                        maximumFractionDigits={
                          priceValues.currencies.USD.fractions || 3
                        }
                      />
                      <br />
                      EUR
                      <FormattedNumber
                        value={priceValues.prices.EUR * amount}
                        maximumFractionDigits={
                          priceValues.currencies.EUR.fractions || 2
                        }
                      />
                    </Tooltip>
                  )}
                </Fragment>
              );
          }
          return ele;
        }}
      </Consumer>
    );
  }
}
