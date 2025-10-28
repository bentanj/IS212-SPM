import { handleFileUpload, handleRemoveFile } from '@/utils/TaskCreateModelFunctions';
import { FormData } from '@/types';

describe('handleFileUpload', () => {
  test('adds files to attachedFiles array when starting empty', () => {
    const mockSetFormData = jest.fn();
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ];

    handleFileUpload(files, mockSetFormData);

    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));

    // Test the updater function
    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: [] } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toEqual(files);
  });

  test('appends new files to existing files', () => {
    const mockSetFormData = jest.fn();
    const existingFiles = [
      new File(['existing'], 'existing.pdf', { type: 'application/pdf' }),
    ];
    const newFiles = [
      new File(['new1'], 'new1.pdf', { type: 'application/pdf' }),
      new File(['new2'], 'new2.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ];

    handleFileUpload(newFiles, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: existingFiles } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toHaveLength(3);
    expect(newState.attachedFiles).toEqual([...existingFiles, ...newFiles]);
  });

  test('handles undefined attachedFiles in previous state', () => {
    const mockSetFormData = jest.fn();
    const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];

    handleFileUpload(files, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = {} as Partial<FormData>; // No attachedFiles property
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toEqual(files);
  });

  test('preserves other form data properties', () => {
    const mockSetFormData = jest.fn();
    const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];

    handleFileUpload(files, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = {
      title: 'Test Task',
      description: 'Test Description',
      attachedFiles: [],
    } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.title).toBe('Test Task');
    expect(newState.description).toBe('Test Description');
    expect(newState.attachedFiles).toEqual(files);
  });
});

describe('handleRemoveFile', () => {
  test('removes file at specified index', () => {
    const mockSetFormData = jest.fn();
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.pdf', { type: 'application/pdf' }),
      new File(['content3'], 'test3.pdf', { type: 'application/pdf' }),
    ];

    handleRemoveFile(1, mockSetFormData); // Remove middle file

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: files } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toHaveLength(2);
    expect(newState.attachedFiles?.[0].name).toBe('test1.pdf');
    expect(newState.attachedFiles?.[1].name).toBe('test3.pdf');
  });

  test('removes first file', () => {
    const mockSetFormData = jest.fn();
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.pdf', { type: 'application/pdf' }),
    ];

    handleRemoveFile(0, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: files } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toHaveLength(1);
    expect(newState.attachedFiles?.[0].name).toBe('test2.pdf');
  });

  test('removes last file', () => {
    const mockSetFormData = jest.fn();
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.pdf', { type: 'application/pdf' }),
    ];

    handleRemoveFile(1, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: files } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toHaveLength(1);
    expect(newState.attachedFiles?.[0].name).toBe('test1.pdf');
  });

  test('returns empty array when removing only file', () => {
    const mockSetFormData = jest.fn();
    const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];

    handleRemoveFile(0, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = { attachedFiles: files } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toEqual([]);
  });

  test('handles undefined attachedFiles', () => {
    const mockSetFormData = jest.fn();

    handleRemoveFile(0, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = {} as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.attachedFiles).toEqual([]);
  });

  test('preserves other form data properties', () => {
    const mockSetFormData = jest.fn();
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.pdf', { type: 'application/pdf' }),
    ];

    handleRemoveFile(0, mockSetFormData);

    const updaterFunction = mockSetFormData.mock.calls[0][0];
    const prevState = {
      title: 'Test Task',
      description: 'Test Description',
      attachedFiles: files,
    } as Partial<FormData>;
    const newState = updaterFunction(prevState);

    expect(newState.title).toBe('Test Task');
    expect(newState.description).toBe('Test Description');
    expect(newState.attachedFiles).toHaveLength(1);
  });
});
