import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './ErrorMessage.module.css';

const ErrorMessage: React.FC = () => {
  const { error } = useSelector((state: RootState) => state.weather);

  if (!error) return null;

  return (
    <div className={styles.errorContainer}>
      <i className="fas fa-exclamation-circle"></i>
      <p>{error}</p>
    </div>
  );
};

export default ErrorMessage; 