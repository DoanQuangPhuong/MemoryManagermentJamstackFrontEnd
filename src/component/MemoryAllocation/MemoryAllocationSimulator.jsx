import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MemoryAllocationSimulator.css';

const MemoryAllocationSimulator = () => {
  const [blockSizes, setBlockSizes] = useState([]);
  const [processSizes, setProcessSizes] = useState([]);
  const [results, setResults] = useState({ allocations: [], allFragmentations: [] });
  const [allocationType, setAllocationType] = useState('first-fit');

  const allocationDefinitions = {
    'first-fit': 'Chọn khối bộ nhớ đầu tiên đủ lớn để cấp phát cho tiến trình.',
    'best-fit': 'Chọn khối bộ nhớ nhỏ nhất đủ lớn để cấp phát cho tiến trình, nhằm giảm thiểu phân mảnh.',
    'worst-fit': 'Chọn khối bộ nhớ lớn nhất để cấp phát cho tiến trình, nhằm giữ lại nhiều không gian trống.',
    'next-fit': 'Giống như First-Fit, nhưng bắt đầu tìm kiếm từ vị trí khối bộ nhớ cuối cùng được cấp phát.',
    'last-fit': 'Chọn khối bộ nhớ cuối cùng đủ lớn để cấp phát cho tiến trình.',
  };
  

  // Handle block size input changes
  const handleBlockSizeChange = (index, value) => {
    const sizes = [...blockSizes];
    sizes[index] = parseInt(value, 10);
    setBlockSizes(sizes);
  };

  // Handle process size input changes
  const handleProcessSizeChange = (index, value) => {
    const sizes = [...processSizes];
    sizes[index] = parseInt(value, 10);
    setProcessSizes(sizes);
  };

  // Call the backend API to allocate memory
  const allocateMemory = async () => {
    try {
      const response = await fetch('http://localhost:5000/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockSizes, processSizes, allocationType }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResults(data); // Set allocations and fragmentation after fetching
    } catch (error) {
      console.error('Error fetching allocation data:', error);
    }
  };

  // Display fragmentation after each process allocation
  const getFragmentationAfterProcess = (index) => {
    if (results.fragmentations && results.fragmentations.length > index) {
      return results.fragmentations[index].map((frag) => `${frag}KB`).join(', ');
    }
    return 'N/A'; // Default if no fragmentation data
  };

  

  // Render memory block diagram
  const renderMemoryBlockDiagram = () => {
    return (
      <div className="memory-block-diagram mt-4">
        <h4 className="text-center">Sơ Đồ Cấp Phát Bộ Nhớ</h4>
        <div className="allocation-legend mt-4 text-start">
              <h6>Màu sắc thể hiện</h6>
              <ul className="legend-list">
                <li><span className="legend-color unallocated"></span> Chưa cấp phát</li>
                <li><span className="legend-color allocated"></span> Đã cấp phát</li>
              </ul>
          </div>
        <div className="diagram-container">
        {blockSizes.map((block, index) => {
       // Tìm tất cả các tiến trình được cấp phát cho block này (index)
            const allocatedProcesses = results.allocations
              .map((allocation, processIndex) => allocation === index ? `P${processIndex + 1}` : null)
              .filter(process => process !== null); // Lọc ra các tiến trình được cấp phát
            
            return (
              <div key={index} className="memory-block">
                <div className="block-label">Bộ nhớ {index + 1}</div>
                <div className={`block ${allocatedProcesses.length > 0 ? 'allocated' : 'unallocated'}`}>
                  {/* Hiển thị tất cả các tiến trình đã được cấp phát cho block này */}
                  {allocatedProcesses.length > 0 
                    ? allocatedProcesses.join(', ') // Nối các tiến trình bằng dấu phẩy nếu có nhiều tiến trình
                    : ''}
                </div>
                <div className="block-size">{results.remainingBlocks[index]}KB</div> {/* Kích thước còn lại */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 custom-title">Tìm hiểu công nghệ Jamstack và xây dựng ứng dụng Web minh họa các giải thuật cấp phát bộ nhớ chính</h1>
      <div className="row justify-content-start">
        <div className="col-md-3">
          <div className="form-group mt-2 text-start">
            <label htmlFor="allocationType">Chọn Loại Cấp Phát Bộ Nhớ</label>
            <select
              className="form-select"
              id="allocationType"
              value={allocationType}
              onChange={(e) => setAllocationType(e.target.value)}
            >
              <option value="first-fit">First-Fit</option>
              <option value="best-fit">Best-Fit</option>
              <option value="worst-fit">Worst-Fit</option>
              <option value="next-fit">Next-Fit</option>
              <option value="last-fit">Last-Fit</option>
            </select>
          </div>
        </div>

        <div className="col-md-9">
          <div className="mt-2 p-3 bg-white bg-white  text-start text-muted">
            <strong>Định nghĩa:</strong> {allocationDefinitions[allocationType]}
          </div>
      </div>

      </div>

      <div className="row mt-5">
        <div className="col-md-6">
          <h4 className="text-center">Bộ Nhớ</h4>
          {blockSizes.map((size, index) => (
            <div key={index} className="input-group mb-2">
              <span className="input-group-text">Bộ nhớ {index + 1}</span>
              <input
                type="text"
                className="form-control"
                value={size || ''}
                onChange={(e) => handleBlockSizeChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="btn btn-primary w-100 btnAddMemory" onClick={() => setBlockSizes([...blockSizes, 0])}>
            Thêm Khối Nhớ
          </button>
        </div>

        <div className="col-md-6">
          <h4 className="text-center">Tiến Trình</h4>
          {processSizes.map((size, index) => (
            <div key={index} className="input-group mb-2">
              <span className="input-group-text">Tiến Trình {index + 1}</span>
              <input
                type="text"
                className="form-control"
                value={size || ''}
                onChange={(e) => handleProcessSizeChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="btn btn-primary w-100 btnAddProcess" onClick={() => setProcessSizes([...processSizes, 0])}>
            Thêm Tiến Trình
          </button>
        </div>
      </div>

      <div className="text-center mt-4 btnCapPhat">
        <button className="btnAllocation" onClick={allocateMemory}>
          Cấp Phát Bộ Nhớ
        </button>
      </div>

      {results.allocations.length > 0 && (
        <div className="mt-4" style={{ marginBottom: '80px'}}>
          <h4 className="text-center">Kết Quả Cấp Phát</h4>
          <table className="table table-bordered table-hover mt-3">
            <thead className="table_header">
              <tr>
                <th>Tiến Trình</th>
                <th>Kích Thước Tiến Trình</th>
                <th>Bộ Nhớ Được Cấp Phát</th>
                <th>Kích Thước Còn Lại</th>
              </tr>
            </thead>
            <tbody>
            {processSizes.map((process, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{process}KB</td>
                <td style={{ color: results.allocations[index] === -1 ? 'red' : 'black'}}>
                    {results.allocations[index] !== -1 ? results.allocations[index] + 1 : 'Không thể thực thi'}
                </td>

                <td>{getFragmentationAfterProcess(index)}</td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* Memory Block Diagram */}
          {renderMemoryBlockDiagram()}
        </div>
      )}
    </div>
  );
};

export default MemoryAllocationSimulator;
