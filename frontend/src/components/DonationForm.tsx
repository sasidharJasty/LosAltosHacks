import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';


interface DonationFormProps {
    onClose: () => void;
    onSubmit: (donation: any) => void;
  }
  
  
  
  function DonationForm({ onClose, onSubmit }: DonationFormProps) {
  
    const orderTypes = [
      { name: 'Fresh Produce' },
      { name: 'Canned Goods'},
      { name: 'Bakery' },
      { name: 'Dairy'},
      { name: 'Frozen Foods'},
      { name: 'Beverages'}
    ];
    
    const [items, setItems] = useState('');
    const [quantity, setQuantity] = useState('');
    const [date, setDate] = useState('');
    const status= 'available';
    const [priority, setPriority] = useState('low');
    const [foodType, setFoodType] = useState(orderTypes[0].name);
    const [location, setLocation] = useState('');
  
    
  
    const handleSubmit = (e:any) => {
      e.preventDefault();
      onSubmit({ items, quantity, date, status, location, foodType, priority });
      onClose();
    };
  
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black">New Donation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="items" className="block text-sm font-medium text-gray-700">Items</Label>
              <Input
                id="items"
                type="text"
                placeholder='e.g., Fresh Produce, Canned Goods'
                value={items}
                onChange={(e) => setItems(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Weight</Label>
              <Input
                id="quantity"
                type="number"
                placeholder='50 oz'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="date" className="block text-sm font-medium text-gray-700">Expiry Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Food Type</Label>
              <select
                id="foodType"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              >
                {orderTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <Label htmlFor="foodType" className="block text-sm font-medium text-gray-700">Priority</Label>
              <select
                id="foodType"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              >
  
                  <option key="low" value="low">
                    low
                  </option>
                  <option key="medium" value="medium">
                    medium
                  </option>
                  <option key="high" value="high">
                    high
                  </option>
              </select>
            </div>
            <div className="mb-4">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder='e.g., New York, NY'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button type="button" onClick={onClose} variant="outline" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

export default DonationForm;