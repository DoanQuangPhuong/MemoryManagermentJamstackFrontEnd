import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MemoryAllocationSimulator.css';

const MemoryAllocationSimulator = () => {
  const [blockSizes, setBlockSizes] = useState([]);
  const [processSizes, setProcessSizes] = useState([]);
  const [results, setResults] = useState({ allocations: [], allFragmentations: [] });
  const [allocationType, setAllocationType] = useState('first-fit');

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

  //Hello
  // Render memory block diagram
  const renderMemoryBlockDiagram = () => {
    return (
      <div className="memory-block-diagram mt-4">
        <h4 className="text-center">Sơ Đồ Cấp Phát Bộ Nhớ</h4>
        <div className="diagram-container">
          {blockSizes.map((block, index) => {
            const processIndex = results.allocations.findIndex(allocation => allocation === index + 1);
            return (
              <div key={index} className="memory-block">
                <div className="block-label">M{index + 1}</div>
                <div className={`block ${processIndex !== -1 ? 'allocated' : 'unallocated'}`}>
                  {processIndex !== -1 ? `P${processIndex + 1}` : ''}
                </div>
                <div className="block-size">{results.remainingBlocks[index]}KB </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 custom-title">Trình Mô Phỏng Bộ Nhớ Được Cấp Phát</h1>

      <div className="row justify-content-end">
        <div className="col-md-4">
          <div className="form-group mt-2 float-end">
            <label htmlFor="allocationType">Chọn loại cấp phát bộ nhớ:</label>
            <select
              className="form-select"
              id="allocationType"
              value={allocationType}
              onChange={(e) => setAllocationType(e.target.value)}
            >
              <option value="first-fit">First-Fit</option>
              <option value="best-fit">Best-Fit</option>
              <option value="worst-fit">Worst-Fit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h4 className="text-center">Bộ Nhớ</h4>
          {blockSizes.map((size, index) => (
            <div key={index} className="input-group mb-2">
              <span className="input-group-text">Bộ nhớ {index + 1}</span>
              <input
                type="number"
                className="form-control"
                value={size || ''}
                onChange={(e) => handleBlockSizeChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="btn btn-primary w-100" onClick={() => setBlockSizes([...blockSizes, 0])}>
            Thêm Khối Nhớ
          </button>
        </div>

        <div className="col-md-6">
          <h4 className="text-center">Tiến Trình</h4>
          {processSizes.map((size, index) => (
            <div key={index} className="input-group mb-2">
              <span className="input-group-text">Tiến Trình {index + 1}</span>
              <input
                type="number"
                className="form-control"
                value={size || ''}
                onChange={(e) => handleProcessSizeChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="btn btn-primary w-100" onClick={() => setProcessSizes([...processSizes, 0])}>
            Thêm Tiến Trình
          </button>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-success" onClick={allocateMemory}>
          Cấp Phát Bộ Nhớ
        </button>
      </div>

      {results.allocations.length > 0 && (
        <div className="mt-4" style={{ marginBottom: '80px'}}>
          <h4 className="text-center">Kết Quả Cấp Phát</h4>
          <table className="table table-bordered table-hover mt-3">
            <thead className="table-dark">
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
                    {results.allocations[index] !== -1 ? results.allocations[index] : 'Không thể thực thi'}
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
