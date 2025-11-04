/**
 * Function to update a product in the eCommerce API.
 *
 * @param {Object} args - Arguments for the product update.
 * @param {number} args.product_id - The ID of the product to update.
 * @param {string} args.name - The updated name of the product.
 * @param {string} args.description - The updated description of the product.
 * @param {number} args.price - The updated price of the product.
 * @param {number} args.stock - The updated stock quantity of the product.
 * @param {string} args.category - The updated category of the product.
 * @returns {Promise<Object>} - The result of the product update.
 */
const executeFunction = async ({ product_id, name, description, price, stock, category }) => {
  const baseUrl = process.env.BASE_URL || '';
  const token = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_UPDATE_PRODUCT_ZLXY7KBI_TOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  const url = `${baseUrl}/products/${product_id}`;

  const body = JSON.stringify({
    name,
    description,
    price,
    stock,
    category
  });

  try {
    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

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
    console.error('Error updating product:', error);
    return {
      error: `An error occurred while updating the product: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for updating a product in the eCommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Update a product in the eCommerce API.',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'integer',
            description: 'The ID of the product to update.'
          },
          name: {
            type: 'string',
            description: 'The updated name of the product.'
          },
          description: {
            type: 'string',
            description: 'The updated description of the product.'
          },
          price: {
            type: 'number',
            description: 'The updated price of the product.'
          },
          stock: {
            type: 'number',
            description: 'The updated stock quantity of the product.'
          },
          category: {
            type: 'string',
            description: 'The updated category of the product.'
          }
        },
        required: ['product_id', 'name', 'description', 'price', 'stock', 'category']
      }
    }
  }
};

export { apiTool };