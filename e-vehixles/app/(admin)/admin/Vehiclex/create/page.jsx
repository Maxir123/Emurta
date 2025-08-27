import React from 'react'
import { AddCarForm } from '../_components/add-New-Vehicles';

export const metadata ={
    title: "Add New Vehicle | Emurta Admin",
    Description: "Add a new vehicles to the market place "
};
const  AddCarPage  = () => {
  return (
    <div> 
      <AddCarForm/>
    </div>
  )
}

export default  AddCarPage 