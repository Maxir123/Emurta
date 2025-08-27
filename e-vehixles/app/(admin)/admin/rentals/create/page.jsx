import React from 'react'
import { AddCarForm } from '../../Vehiclex/_components/add-New-Vehicles';

export const metadata ={
    title: "Vehicles | Emurta Admin",
    Description: "Manage cars in your marketplace"
};
const REntalPage
 = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Rental</h1>
      <AddCarForm/>
    </div>
  )
}

export default REntalPage
