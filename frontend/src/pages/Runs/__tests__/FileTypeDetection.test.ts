/**
 * Tests for file type detection logic in artifact handling
 * This file tests the utility functions used to determine which files can be displayed as text
 */

// Mock the RunDetail component's utility functions
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const isTextFile = (filename: string, isBinary?: boolean): boolean => {
  // MLmodel is a special MLflow file that should always be treated as text
  if (filename === 'MLmodel') return true;
  
  if (isBinary) return false;
  
  const extension = getFileExtension(filename);
  const textExtensions = [
    'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx',
    'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
    'sql', 'sh', 'bash', 'ps1', 'bat', 'log', 'csv', 'ini', 'cfg', 'conf', 'env',
    'dockerfile', 'makefile', 'cmake', 'gradle', 'maven', 'pom', 'xml'
  ];
  
  // Check if file has a supported extension
  if (extension && textExtensions.includes(extension)) {
    return true;
  }
  
  // Check for special files without extensions
  const specialFiles = ['Dockerfile', 'Makefile', 'README', 'LICENSE', '.env', '.gitignore'];
  return specialFiles.includes(filename);
};

const shouldLoadFileContent = (filename: string, isBinary?: boolean, fileSize?: number): boolean => {
  // Special handling for MLmodel file - always load it regardless of binary status
  const isMLmodel = filename === 'MLmodel';
  
  // Don't load if file is binary or too large (> 1MB), except for MLmodel
  if (!isMLmodel && (isBinary || (fileSize && fileSize > 1024 * 1024))) {
    return false;
  }
  
  // Don't load if it's not a text file, except for MLmodel
  if (!isMLmodel && !isTextFile(filename, isBinary)) {
    return false;
  }
  
  return true;
};

describe('File Type Detection', () => {
  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('config.json')).toBe('json');
      expect(getFileExtension('script.py')).toBe('py');
      expect(getFileExtension('README.md')).toBe('md');
      expect(getFileExtension('MLmodel')).toBe('');
      expect(getFileExtension('file')).toBe('');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileExtension('file.backup.txt')).toBe('txt');
      expect(getFileExtension('config.prod.json')).toBe('json');
    });

    it('should be case insensitive', () => {
      expect(getFileExtension('FILE.TXT')).toBe('txt');
      expect(getFileExtension('Config.JSON')).toBe('json');
    });
  });

  describe('isTextFile', () => {
    it('should always return true for MLmodel file', () => {
      expect(isTextFile('MLmodel')).toBe(true);
      expect(isTextFile('MLmodel', true)).toBe(true); // Even if marked as binary
      expect(isTextFile('MLmodel', false)).toBe(true);
    });

    it('should return false for binary files', () => {
      expect(isTextFile('image.png', true)).toBe(false);
      expect(isTextFile('model.pkl', true)).toBe(false);
      expect(isTextFile('data.bin', true)).toBe(false);
    });

    it('should return true for supported text file extensions', () => {
      // Code files
      expect(isTextFile('script.py')).toBe(true);
      expect(isTextFile('app.js')).toBe(true);
      expect(isTextFile('component.tsx')).toBe(true);
      expect(isTextFile('Main.java')).toBe(true);
      expect(isTextFile('program.c')).toBe(true);
      expect(isTextFile('main.go')).toBe(true);

      // Data files
      expect(isTextFile('config.json')).toBe(true);
      expect(isTextFile('settings.yaml')).toBe(true);
      expect(isTextFile('data.xml')).toBe(true);
      expect(isTextFile('readme.md')).toBe(true);
      expect(isTextFile('log.txt')).toBe(true);
      expect(isTextFile('data.csv')).toBe(true);

      // Config files
      expect(isTextFile('Dockerfile')).toBe(true);
      expect(isTextFile('Makefile')).toBe(true);
      expect(isTextFile('requirements.txt')).toBe(true);
      expect(isTextFile('.env')).toBe(true);
      expect(isTextFile('config.ini')).toBe(true);
    });

    it('should return false for unsupported file extensions', () => {
      expect(isTextFile('image.png')).toBe(false);
      expect(isTextFile('video.mp4')).toBe(false);
      expect(isTextFile('archive.zip')).toBe(false);
      expect(isTextFile('document.pdf')).toBe(false);
      expect(isTextFile('executable.exe')).toBe(false);
      expect(isTextFile('unknown.xyz')).toBe(false);
    });

    it('should handle files without extensions', () => {
      expect(isTextFile('README')).toBe(true); // Special case
      expect(isTextFile('LICENSE')).toBe(true); // Special case
      expect(isTextFile('Makefile')).toBe(true); // Special case
      expect(isTextFile('Dockerfile')).toBe(true); // Special case
      expect(isTextFile('unknown')).toBe(false); // Not in special files list
    });
  });

  describe('shouldLoadFileContent', () => {
    it('should always load MLmodel files regardless of other properties', () => {
      expect(shouldLoadFileContent('MLmodel')).toBe(true);
      expect(shouldLoadFileContent('MLmodel', true)).toBe(true); // Binary
      expect(shouldLoadFileContent('MLmodel', false, 2 * 1024 * 1024)).toBe(true); // Large
      expect(shouldLoadFileContent('MLmodel', true, 2 * 1024 * 1024)).toBe(true); // Binary + Large
    });

    it('should load text files under 1MB', () => {
      expect(shouldLoadFileContent('config.json', false, 512)).toBe(true);
      expect(shouldLoadFileContent('script.py', false, 1024)).toBe(true);
      expect(shouldLoadFileContent('readme.md', false, 2048)).toBe(true);
    });

    it('should not load binary files', () => {
      expect(shouldLoadFileContent('image.png', true, 512)).toBe(false);
      expect(shouldLoadFileContent('model.pkl', true, 1024)).toBe(false);
      expect(shouldLoadFileContent('data.bin', true, 2048)).toBe(false);
    });

    it('should not load files over 1MB', () => {
      expect(shouldLoadFileContent('large.txt', false, 2 * 1024 * 1024)).toBe(false);
      expect(shouldLoadFileContent('huge.json', false, 5 * 1024 * 1024)).toBe(false);
    });

    it('should not load unsupported file types', () => {
      expect(shouldLoadFileContent('image.png', false, 512)).toBe(false);
      expect(shouldLoadFileContent('video.mp4', false, 1024)).toBe(false);
      expect(shouldLoadFileContent('archive.zip', false, 2048)).toBe(false);
    });

    it('should handle files without size information', () => {
      expect(shouldLoadFileContent('config.json', false)).toBe(true);
      expect(shouldLoadFileContent('image.png', true)).toBe(false);
      expect(shouldLoadFileContent('unknown.xyz', false)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(shouldLoadFileContent('', false, 512)).toBe(false); // Empty filename
      expect(shouldLoadFileContent('file.txt', false, 0)).toBe(true); // Zero size
      expect(shouldLoadFileContent('file.txt', false, 1024 * 1024)).toBe(true); // Exactly 1MB
      expect(shouldLoadFileContent('file.txt', false, 1024 * 1024 + 1)).toBe(false); // Just over 1MB
    });
  });

  describe('Real-world MLflow artifact scenarios', () => {
    it('should handle typical MLflow model artifacts', () => {
      // MLmodel - should always load
      expect(shouldLoadFileContent('MLmodel', false, 927)).toBe(true);
      
      // Model files - should not load (binary)
      expect(shouldLoadFileContent('model.pkl', true, 1024)).toBe(false);
      expect(shouldLoadFileContent('model.joblib', true, 2048)).toBe(false);
      
      // Environment files - should load
      expect(shouldLoadFileContent('conda.yaml', false, 256)).toBe(true);
      expect(shouldLoadFileContent('python_env.yaml', false, 120)).toBe(true);
      expect(shouldLoadFileContent('requirements.txt', false, 135)).toBe(true);
      
      // Config files - should load
      expect(shouldLoadFileContent('config.json', false, 512)).toBe(true);
      expect(shouldLoadFileContent('params.yaml', false, 128)).toBe(true);
      
      // Log files - should load
      expect(shouldLoadFileContent('training.log', false, 1024)).toBe(true);
      expect(shouldLoadFileContent('metrics.json', false, 256)).toBe(true);
    });

    it('should handle large model files correctly', () => {
      // Large model files should not load
      expect(shouldLoadFileContent('large_model.pkl', true, 10 * 1024 * 1024)).toBe(false);
      expect(shouldLoadFileContent('huge_model.bin', true, 100 * 1024 * 1024)).toBe(false);
      
      // But MLmodel should still load even if large
      expect(shouldLoadFileContent('MLmodel', false, 10 * 1024 * 1024)).toBe(true);
    });

    it('should handle mixed file types in a directory', () => {
      const files = [
        { name: 'MLmodel', isBinary: false, size: 927 },
        { name: 'model.pkl', isBinary: true, size: 1024 },
        { name: 'conda.yaml', isBinary: false, size: 256 },
        { name: 'requirements.txt', isBinary: false, size: 135 },
        { name: 'image.png', isBinary: true, size: 512 },
        { name: 'config.json', isBinary: false, size: 1024 * 1024 + 1 }, // Over 1MB
      ];

      const results = files.map(file => ({
        name: file.name,
        shouldLoad: shouldLoadFileContent(file.name, file.isBinary, file.size)
      }));

      expect(results).toEqual([
        { name: 'MLmodel', shouldLoad: true },
        { name: 'model.pkl', shouldLoad: false },
        { name: 'conda.yaml', shouldLoad: true },
        { name: 'requirements.txt', shouldLoad: true },
        { name: 'image.png', shouldLoad: false },
        { name: 'config.json', shouldLoad: false },
      ]);
    });
  });
});
