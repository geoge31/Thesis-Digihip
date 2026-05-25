    /**
     * 
     */

    import React from "react";

    interface ApptStAlt {
        state: boolean;
        type: { [key: number]: string };
    }

    const ApptStatusAlert: React.FC<ApptStAlt> = ({ type }) => {

        switch(type){
            case "":
                return<></>;
            case "success":
                return<></>;
            default:
                return<></>;
        }

    };

    export default ApptStatusAlert;