﻿using System.Collections.Generic;

namespace Kore.Plugins.Ecommerce.Simple.Models
{
    public class ShoppingCartItem
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; }

        public short Quantity { get; set; }

        public float Price { get; set; }
    }
}