/**
 * 
 */

import React from "react";
import styles from './CancelSave.module.css'
import { GrClose, GrCheckmark } from "react-icons/gr";


interface CustomButtonProps {
    onClickCancel: () => void;
    onClickSave: () => void;
}

const CnlSvBtns: React.FC<CustomButtonProps> = ({ onClickCancel, onClickSave }) => {
    return (
      <div className={styles.cnlsvDiv}>
            <button
                type='button'
                name='cancel'
                title='cancel'
                onClick={onClickCancel}
                >{<GrClose/>}
            </button>
            <button
                type='button'
                name='save'
                title='save'
                onClick={onClickSave}
                >{<GrCheckmark/>}
            </button>
      </div>
    );
};
  
export default CnlSvBtns;
