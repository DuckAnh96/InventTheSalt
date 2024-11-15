import React, { useState, useEffect, useContext } from 'react';
import { db } from "../firebase/config";
import Swal from 'sweetalert2';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Edit, Trash, PackagePlus, ChevronRight, ChevronLeft, Info, Minus, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { currentUser } = useContext(AuthContext);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedProducts = products.slice(indexOfFirst, indexOfLast);

    let now = new Date();
    let utcOffset = now.getTimezoneOffset();
    let vietnamOffset = 7 * 60;
    let diff = utcOffset + vietnamOffset;
    now.setMinutes(now.getMinutes() - diff);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollectionRef = collection(db, 'products');
                const snapshot = await getDocs(productsCollectionRef);
                const productsList = snapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        index: index + 1,
                        timestamp: data.timestamp?.toDate().toLocaleString() || 'N/A'  
                    };
                });
                setProducts(productsList)
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };
        fetchProducts();
    }, []);

    const handleAdd = async () => {
        Swal.fire({
            title: 'Thêm sản phẩm',
            html: `
                <label>Tên sản phẩm:</label><br>
                <input id="name" class="swal2-input" style="width: 80%;" /><br/>
                <label>Số lượng</label><br>
                <input id="quantity" type="number" class="swal2-input" style="width: 80%;"  /><br/>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const quantity = parseInt(Swal.getPopup().querySelector('#quantity').value);
                return { name, quantity };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const newProduct = result.value;
                try {
                    // Cập nhật dữ liệu trong Firestore
                    await addDoc(collection(db, "products"), { ...newProduct, timestamp: now, updatedBy: currentUser?.email || 'Không có thông tin' });
                    // Cập nhật state
                    setProducts([...products, { ...newProduct, index: products.length + 1 }]);
                    Swal.fire('Thành công!', 'Sản phẩm đã được thêm', 'success');
                    addDoc(collection(db, 'inventoryHistory'), {
                        product: newProduct.name,
                        quantityChangeTo: newProduct.quantity,
                        timestamp: now,
                        updatedBy: currentUser?.email || 'Không có thông tin'
                    });
                } catch (error) {
                    console.error("Error updating product: ", error);
                    Swal.fire('Thất bại', 'Có lỗi xảy ra trong quá trình cập nhật', 'error');
                }
            }
        });
    }

    const handleInfo = (item) => {
        Swal.fire({
            title: 'Thông tin sản phẩm',
            html: `
                <div style="display: flex; justify-content: space-between;">
                    <strong>Tên sản phẩm:</strong> 
                    <span>${item.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Số lượng còn lại:</strong> 
                    <span>${item.quantity}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Thời gian cập nhật lần cuối:</strong> 
                    <span>${item.timestamp}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Cập nhập lần cuối bởi:</strong> 
                    <span>${item.updatedBy}</span>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Đóng'
        });
    };

    const handleEdit = async (item) => {
        Swal.fire({
            title: 'Chỉnh sửa thông tin sản phẩm',
            html: `
                <label>Tên sản phẩm:</label><br>
                <input id="name" class="swal2-input" style="width: 80%;" value="${item.name}" /><br/>
                <label>Số lượng còn lại:</label><br>
                <input id="quantity" type="number" class="swal2-input" style="width: 80%;" value="${item.quantity}" /><br/>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const quantity = parseInt(Swal.getPopup().querySelector('#quantity').value);

                return { name, quantity };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedData = result.value;
                try {
                    // Cập nhật state
                    setProducts(products.map((prod) => (prod.id === item.id ? { ...prod, ...updatedData } : prod)));
                    await updateDoc(doc(db, "products", item.id), { ...updatedData, timestamp: now, updatedBy: currentUser?.email || 'Không có thông tin' });
                    // Cập nhật dữ liệu trong Firestore
                    addDoc(collection(db, 'inventoryHistory'), {
                        product: updatedData.name,
                        quantityChangeTo: updatedData.quantity,
                        timestamp: now,
                        updatedBy: currentUser?.email || 'Không có thông tin'
                    });
                    Swal.fire('Thành công!', 'Sản phẩm đã được cập nhật.', 'success');
                } catch (error) {
                    console.error("Error updating product: ", error);
                    Swal.fire('Thất bại', 'Có lỗi xảy ra trong quá trình cập nhật', 'error');
                }
            }
        });
    };

    const handleDelete = async (item) => {
        Swal.fire({
            title: `Xác nhận?`,
            text: `Xác nhận xóa ${item.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setProducts(products.filter(i => i.id !== item.id));
                    await deleteDoc(doc(db, "products", item.id));
                    addDoc(collection(db, 'inventoryHistory'), {
                        product: item.name,
                        quantityChangeTo: "Xóa",
                        timestamp: now,
                        updatedBy: currentUser?.email || 'Không có thông tin'
                    });
                    Swal.fire('Thành công!', 'Sản phẩm này đã xóa', 'success');
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    Swal.fire('Thất bại', 'Đã xảy ra lỗi nào đó', 'error');

                }
            }
        });
    };

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

    const handleQuantityChange = async (product, change) => {
        const updatedQuantity = product.quantity + change;
        if (updatedQuantity < 0) return;  // Không cho phép số lượng âm

        try {
            setProducts(products.map((p) => p.id === product.id ? { ...p, quantity: updatedQuantity } : p));
            await updateDoc(doc(db, "products", product.id), { quantity: updatedQuantity, timestamp: now, updatedBy: currentUser?.email || 'Không có thông tin' });
            addDoc(collection(db, 'inventoryHistory'), {
                product: product.name,
                quantityChangeTo: updatedQuantity,
                timestamp: now,
                updatedBy: currentUser?.email || 'Không có thông tin'
            });
        } catch (error) {
            console.error("Error updating quantity: ", error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={styles.text}>Quản lý sản phẩm</h1>
                <button style={styles.addButton} onClick={() => handleAdd()}><PackagePlus size={16} />Thêm sản phẩm mới</button>
            </div>

            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedProducts.length} sản phẩm trong trang này</h3>

            {paginatedProducts.length === 0 ? (
                <h1>Không tìm thấy sản phẩm nào</h1>
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
                                <td style={styles.text}>{item.name}</td>
                                <td style={styles.text}>
                                    <button style={styles.actionButton} onClick={() => handleQuantityChange(item, -1)}>
                                        <Minus size={16} />
                                    </button>
                                    {item.quantity}
                                    <button style={styles.actionButton} onClick={() => handleQuantityChange(item, 1)}>
                                        <Plus size={16} />
                                    </button>
                                </td>
                                <td style={styles.actions}>
                                    <button style={styles.actionButton} onClick={() => handleInfo(item)}>
                                        <Info size={20} color='blue' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleEdit(item)}>
                                        <Edit size={20} color='black' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleDelete(item)}>
                                        <Trash size={20} color='red' />
                                    </button>
                                </td>
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
                    {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, index) => (
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
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(products.length / itemsPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Products;

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
    addButton: {
        marginTop: '10px',
        marginBottom: '20px',
        padding: '8px 16px',
        borderColor: '#4CAF50',
        color: 'black',
        backgroundColor: '#f7f7f7',
        border: '10',
        borderRadius: '4px',
        cursor: 'pointer',
        alignItems: 'center',
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
    actions: {
        display: 'flex',
        justifyContent: 'center',
        height: '80px',
    },
    actionButton: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
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