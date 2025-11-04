/**
 * Function to get an order by its ID from the eCommerce API.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.order_id - The ID of the order to retrieve.
 * @returns {Promise<Object>} - The result of the order retrieval.
 */
const executeFunction = async ({ order_id }) => {
  const baseUrl = process.env.BASE_URL || '';
  const token = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_GET_ORDER_BY_ID_9N4TXUBF_TOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for the order retrieval
    const url = `${baseUrl.replace(/\/$/, '')}/orders/${order_id}`;

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving order:', error);
    return {
      error: `An error occurred while retrieving the order: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting an order by ID from the eCommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_order_by_id',
      description: 'Get an order by its ID from the eCommerce API.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'string',
            description: 'The ID of the order to retrieve.'
          }
        },
        required: ['order_id']
      }
    }
  }
};

export { apiTool };