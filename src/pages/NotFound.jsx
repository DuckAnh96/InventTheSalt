import React from 'react';
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent:'center'}}>
            <h1>404</h1>
            <h3>Bạn đã trôi lạc vào không gian vũ trụ, hmmm có vẻ như trang này không tồn tại.</h3>
            <Link to="/" style={{ border: '3px solid', width:'250px', height:'120px'}}>
                <button >Trang chủ</button>
            </Link>
        </div>
    );
};

export default NotFound;
