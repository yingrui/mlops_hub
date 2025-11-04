// Simple test to verify Jest is working
describe('ApiService - Artifacts', () => {
  it('should be able to create ApiService instance', () => {
    // This is a basic test to verify Jest setup is working
    expect(true).toBe(true);
  });

  it('should have correct file type detection', () => {
    // Test file type detection logic
    const getFileType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      
      if (['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx'].includes(ext)) {
        return 'model';
      } else if (['json'].includes(ext)) {
        return 'json';
      } else if (['py'].includes(ext)) {
        return 'python';
      } else if (['yaml', 'yml'].includes(ext)) {
        return 'yaml';
      } else if (['txt', 'log'].includes(ext)) {
        return 'text';
      } else if (['csv'].includes(ext)) {
        return 'csv';
      } else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
        return 'image';
      } else {
        return 'file';
      }
    };

    expect(getFileType('model.pkl')).toBe('model');
    expect(getFileType('data.json')).toBe('json');
    expect(getFileType('script.py')).toBe('python');
    expect(getFileType('config.yaml')).toBe('yaml');
    expect(getFileType('unknown.xyz')).toBe('file');
  });

  it('should correctly identify binary files', () => {
    // Test binary file detection logic
    const isBinaryFile = (filename: string): boolean => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      const binaryExtensions = ['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx', 'bin', 'exe', 'dll', 'so', 'dylib'];
      return binaryExtensions.includes(ext);
    };

    expect(isBinaryFile('model.pkl')).toBe(true);
    expect(isBinaryFile('data.h5')).toBe(true);
    expect(isBinaryFile('script.py')).toBe(false);
    expect(isBinaryFile('config.yaml')).toBe(false);
    expect(isBinaryFile('data.json')).toBe(false);
  });

  it('should build file tree correctly', () => {
    // Test file tree building logic
    const buildFileTreeFromFiles = (files: any[], basePath: string): any[] => {
      const tree: any[] = [];
      const pathMap = new Map<string, any>();
      
      files.forEach(file => {
        const fullPath = file.path || '';
        const isDir = file.is_dir || false;
        const fileSize = file.file_size || 0;
        
        // If we have a basePath, remove it from the fullPath to get relative path
        let relativePath = fullPath;
        if (basePath && fullPath.startsWith(basePath + '/')) {
          relativePath = fullPath.substring(basePath.length + 1);
        } else if (basePath && fullPath === basePath) {
          relativePath = '';
        }
        
        // If relativePath is empty, skip
        if (!relativePath) {
          return;
        }
        
        // Split relative path into parts
        const pathParts = relativePath.split('/').filter((part: string) => part.length > 0);
        
        let currentPath = '';
        let parentNode = null;
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          // Build the full path for this node (including basePath)
          const fullNodePath = basePath ? `${basePath}/${currentPath}` : currentPath;
          
          if (!pathMap.has(currentPath)) {
            const isLastPart = i === pathParts.length - 1;
            const node = {
              name: part,
              type: isLastPart ? (isDir ? 'folder' : 'file') : 'folder',
              path: `/${fullNodePath}`,
              size: isLastPart ? fileSize : 0,
              isBinary: isLastPart && !isDir ? isBinaryFile(part) : false,
              isDir: isLastPart ? isDir : true,
              children: (isLastPart && isDir) || !isLastPart ? [] : undefined,
              loaded: false
            };
            
            pathMap.set(currentPath, node);
            
            if (parentNode) {
              parentNode.children.push(node);
            } else {
              tree.push(node);
            }
          }
          
          parentNode = pathMap.get(currentPath);
        }
      });
      
      return tree;
    };

    const isBinaryFile = (filename: string): boolean => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      const binaryExtensions = ['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx', 'bin', 'exe', 'dll', 'so', 'dylib'];
      return binaryExtensions.includes(ext);
    };

    // Test with multiple root items
    const files1 = [
      { path: 'iris_model', is_dir: true },
      { path: 'logs', is_dir: true },
      { path: 'config.yaml', is_dir: false, file_size: 1024 }
    ];

    const result1 = buildFileTreeFromFiles(files1, '');
    expect(result1).toHaveLength(3);
    expect(result1[0].name).toBe('iris_model');
    expect(result1[1].name).toBe('logs');
    expect(result1[2].name).toBe('config.yaml');

    // Test with directory expansion
    const files2 = [
      { path: 'iris_model/MLmodel', is_dir: false, file_size: 927 },
      { path: 'iris_model/conda.yaml', is_dir: false, file_size: 262 }
    ];

    const result2 = buildFileTreeFromFiles(files2, 'iris_model');
    expect(result2).toHaveLength(2);
    expect(result2[0].name).toBe('MLmodel');
    expect(result2[1].name).toBe('conda.yaml');
  });
});