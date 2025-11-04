/**
 * Function to create a new product in the eCommerce API.
 *
 * @param {Object} product - The product details to create.
 * @param {string} product.name - The name of the product.
 * @param {string} product.description - A description of the product.
 * @param {number} product.price - The price of the product.
 * @param {number} product.stock - The stock quantity of the product.
 * @param {string} product.category - The category of the product.
 * @returns {Promise<Object>} - The response from the API after creating the product.
 */
const executeFunction = async ({ name, description, price, stock, category }) => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_CREATE_PRODUCT_MKPWVGQH_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  const productData = {
    name,
    description,
    price,
    stock,
    category
  };

  try {
    // Perform the fetch request
    const response = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(productData)
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
    console.error('Error creating product:', error);
    return {
      error: `An error occurred while creating the product: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for creating a product in the eCommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_product',
      description: 'Create a new product in the eCommerce API.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the product.'
          },
          description: {
            type: 'string',
            description: 'A description of the product.'
          },
          price: {
            type: 'number',
            description: 'The price of the product.'
          },
          stock: {
            type: 'number',
            description: 'The stock quantity of the product.'
          },
          category: {
            type: 'string',
            description: 'The category of the product.'
          }
        },
        required: ['name', 'description', 'price', 'stock', 'category']
      }
    }
  }
};

export { apiTool };