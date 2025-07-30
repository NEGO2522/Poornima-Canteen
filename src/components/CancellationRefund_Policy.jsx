import React from 'react';
import { useNavigate } from 'react-router-dom';

const CancellationRefundPolicy = () => {
  const navigate = useNavigate();
  
  const handleBackToMenu = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h1 className="text-3xl font-bold mb-2">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last updated on Jul 30th 2025
        </p>

        <div className="mt-6">
          <p className="mb-4">
            solvers believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
          </p>

          <div className="pl-4">
            <ul className="list-disc space-y-3 mb-4">
              <li>Cancellations will be considered only if the request is made within 1-2 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.</li>
              <li>solvers does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.</li>
              <li>In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 1-2 days of receipt of the products.</li>
              <li>In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1-2 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.</li>
              <li>In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.</li>
              <li>In case of any Refunds approved by the solvers, it'll take 1-2 days for the refund to be processed to the end customer.</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mt-6 italic">
            Disclaimer: The above content is created at MANISH KUMAR's sole discretion. Razorpay shall not be liable for any content provided here and shall not be responsible for any claims and liability that may arise due to merchant's non-adherence to it.
          </p>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleBackToMenu}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;