/**
 * Function to get a product by its ID from the ecommerce API.
 *
 * @param {Object} args - Arguments for the product retrieval.
 * @param {string} args.product_id - The ID of the product to retrieve.
 * @returns {Promise<Object>} - The product details or an error message.
 */
const executeFunction = async ({ product_id }) => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_GET_PRODUCT_BY_ID_6RA7F9UD_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for the product retrieval
    const url = `${baseUrl}/products/${product_id}`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
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
    console.error('Error retrieving product:', error);
    return {
      error: `An error occurred while retrieving the product: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting a product by ID from the ecommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_product_by_id',
      description: 'Retrieve a product by its ID from the ecommerce API.',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The ID of the product to retrieve.'
          }
        },
        required: ['product_id']
      }
    }
  }
};

export { apiTool };