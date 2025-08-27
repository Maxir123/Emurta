import React from 'react'
import VehiclesLists from './_components/Vehicles-Lists';

export const metadata ={
    title: "Vehicles | Emurta Admin",
    Description: "Manage cars in your marketplace"
};
const VehicleXPage
 = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <VehiclesLists />
    </div>
  )
}

export default VehicleXPage
