import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, getDocs } from 'firebase/firestore';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Statistics = () => {
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedProducts = history.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const ref = collection(db, 'inventoryHistory');
                const snapshot = await getDocs(ref);
                const historyList = snapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        index: index + 1,
                        timestamp: data.timestamp?.toDate().toLocaleString() || 'N/A'  
                    };
                });
                setHistory(historyList)
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };
        fetchProducts();
    }, []);
    
    const handleNextPage = () => {
        if (currentPage < Math.ceil(products.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    return (
        <div style={styles.container}>
            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedProducts.length} lịch sử thay đổi trong trang này</h3>
            {paginatedProducts.length === 0 ? (
                <h1>Không tìm thấy bất kỳ lịch sử thay đổi nào</h1>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableRow}>
                            <th>#</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map(item => (
                            <tr key={item.id} style={styles.tableRow}>
                                <td>{item.index}</td>
                                <td style={styles.text}>{item.product}</td>
                                <td style={styles.text}>{item.quantityChangeTo}</td>
                                <td style={styles.text}>{item.timestamp}</td>
                                <td style={styles.text}>{item.updatedBy}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={styles.pagination}>
                <button style={styles.btnNavigationPage} onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft size={25} />
                </button>
                <div>
                    {Array.from({ length: Math.ceil(history.length / itemsPerPage) }, (_, index) => (
                        <span key={index} style={{
                            color: '#000',
                            backgroundColor: '#f9f9f9',
                            padding: '5px 10px',
                            display: 'inline-block',
                            margin: '0 5px',
                            cursor: 'pointer'
                        }}
                            onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                        </span>
                    ))}
                </div>
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(history.length / itemsPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Statistics;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
        height: '100%',
        minHeight: '100vh',
    },
    text: {
        color: '#000',
    },
    table: {
        width: '100%',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 150px)',
    },
    tableRow: {
        minHeight: '50px',
        textAlign: 'center',
        borderBottom: '1px solid #ccc',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        width: '50%',
    },
    btnNavigationPage: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '50px',
        height: '80px',
        cursor: 'pointer',
        border: '0px'
    }
};