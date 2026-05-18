const sizes = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12'
};

const LoadingSpinner = ({ size = 'medium', colour = 'border-blue-600' }) => (
  <div className={`animate-spin rounded-full border-b-2 
    ${sizes[size]} ${colour}`} />
);

export default LoadingSpinner;
