/// <reference types="web-bluetooth" />

import React, { useState } from 'react';
import './App.css';
import logo from './logo.svg';

function App() {

  const [count, setCount] = useState(0)

  const parseValue = (value: any) => {
    value = value.buffer ? value : new DataView(value);
    let flags = value.getUint8(0);

    let rate16Bits = flags & 0x1;
    let result = {} as any;
    let index = 1;

    if (rate16Bits) {
      result.heartRate = value.getUint16(index, true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }

    let rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      let rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, true));
      }
      result.rrIntervals = rrIntervals;
    }

    return result;
  }

  const handleCharacteristicValueChanged = (event: any) => {
    var value = event.target.value;
    // console.log(parseValue(value).heartRate);
    setCount(parseValue(value).heartRate);
  }

  const onClickHandler = () => {
    navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      filters: [{ services: ['heart_rate'] }]
    })
      .then((device) => {
        return device.gatt?.connect();
      })
      .then(server => {
        return server?.getPrimaryService('heart_rate');
      })
      .then(service => {
        return service?.getCharacteristic('heart_rate_measurement');
      })
      .then(characteristic => characteristic?.startNotifications())
      .then(characteristic => {
        console.log(characteristic);

        if (characteristic)
          characteristic.addEventListener(
            'characteristicvaluechanged', handleCharacteristicValueChanged
          );
      })
      .catch(error => { console.log(error); });
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1 style={{ color: "red" }}>{count}</h1>
        {!count && <button onClick={onClickHandler}>API</button>}
      </header>
    </div>
  );
}

export default App;
