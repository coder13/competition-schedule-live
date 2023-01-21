import tw from 'tailwind-styled-components';

export const Button = tw.button`
bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm
`;

export const UserLink = tw.a`
text-blue-500 hover:text-blue-700
`;

export const Input = tw.input`
shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
`;

export const Select = tw.select`
bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
`;
