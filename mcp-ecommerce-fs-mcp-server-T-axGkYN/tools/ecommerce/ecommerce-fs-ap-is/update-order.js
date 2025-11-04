/**
 * Function to update an order in the eCommerce system.
 *
 * @param {Object} args - Arguments for the order update.
 * @param {string} args.order_id - The ID of the order to update.
 * @param {string} args.customer_name - The name of the customer.
 * @param {string} args.customer_email - The email of the customer.
 * @param {number} args.quantity - The quantity of items ordered.
 * @param {string} args.status - The status of the order.
 * @returns {Promise<Object>} - The result of the order update.
 */
const executeFunction = async ({ order_id, customer_name, customer_email, quantity, status }) => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_UPDATE_ORDER_IIMUOIEX_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for the order update
    const url = `${baseUrl}/orders/${order_id}`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // Create the body of the request
    const body = JSON.stringify({
      customer_name,
      customer_email,
      quantity,
      status
    });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body
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
    console.error('Error updating order:', error);
    return {
      error: `An error occurred while updating the order: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for updating an order in the eCommerce system.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_order',
      description: 'Update an order in the eCommerce system.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'string',
            description: 'The ID of the order to update.'
          },
          customer_name: {
            type: 'string',
            description: 'The name of the customer.'
          },
          customer_email: {
            type: 'string',
            description: 'The email of the customer.'
          },
          quantity: {
            type: 'integer',
            description: 'The quantity of items ordered.'
          },
          status: {
            type: 'string',
            description: 'The status of the order.'
          }
        },
        required: ['order_id', 'customer_name', 'customer_email', 'quantity', 'status']
      }
    }
  }
};

export { apiTool };