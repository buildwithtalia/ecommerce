/**
 * Function to create an order in the eCommerce system.
 *
 * @param {Object} orderDetails - The details of the order to create.
 * @param {string} orderDetails.customer_name - The name of the customer.
 * @param {string} orderDetails.customer_email - The email of the customer.
 * @param {number} orderDetails.product_id - The ID of the product being ordered.
 * @param {number} orderDetails.quantity - The quantity of the product being ordered.
 * @param {string} orderDetails.status - The status of the order.
 * @returns {Promise<Object>} - The result of the order creation.
 */
const executeFunction = async ({ customer_name, customer_email, product_id, quantity, status }) => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_CREATE_ORDER_PIRIDERK_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for creating an order
    const url = `${baseUrl}/orders`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // Create the order payload
    const payload = {
      customer_name,
      customer_email,
      product_id,
      quantity,
      status
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      error: `An error occurred while creating the order: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for creating an order in the eCommerce system.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_order',
      description: 'Create a new order in the eCommerce system.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: {
            type: 'string',
            description: 'The name of the customer.'
          },
          customer_email: {
            type: 'string',
            description: 'The email of the customer.'
          },
          product_id: {
            type: 'integer',
            description: 'The ID of the product being ordered.'
          },
          quantity: {
            type: 'integer',
            description: 'The quantity of the product being ordered.'
          },
          status: {
            type: 'string',
            description: 'The status of the order.'
          }
        },
        required: ['customer_name', 'customer_email', 'product_id', 'quantity', 'status']
      }
    }
  }
};

export { apiTool };