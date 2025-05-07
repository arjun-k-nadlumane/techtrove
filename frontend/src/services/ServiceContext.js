import { createContext } from 'react';
 
export const ServiceContext = createContext({
  customerService: null,
  productService: null,
  feedbackService: null
});