/**
 * 
 */

import React, {ReactNode} from "react";
import styles from './EditButton.module.css'

interface CustomButtonProps {
    onClick: () => void;
    children: ReactNode;
}

const EditButton: React.FC<CustomButtonProps> = ({ onClick, children }) => {
    return (
      <div>
        <button
            type='button'
            title='edit'
            onClick={onClick}
            className={styles.edtBtn}
          >
            { children }
        </button>
      </div>
    );
  };
  
  export default EditButton;