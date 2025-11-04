/**
 * Function to delete a product from the eCommerce API.
 *
 * @param {Object} args - Arguments for the delete operation.
 * @param {string} args.product_id - The ID of the product to delete.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
const executeFunction = async ({ product_id }) => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_DELETE_PRODUCT_V9WVLVR_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for the delete request
    const url = `${baseUrl}/products/${product_id}`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
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
    console.error('Error deleting product:', error);
    return {
      error: `An error occurred while deleting the product: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for deleting a product from the eCommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_product',
      description: 'Delete a product from the eCommerce API.',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The ID of the product to delete.'
          }
        },
        required: ['product_id']
      }
    }
  }
};

export { apiTool };