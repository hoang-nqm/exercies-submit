import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

import { Form, Select, Input, Button, Typography, notification, Card  } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

function StudentSubmit() {
  const [assignments, setAssignments] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedAssignmentContent, setSelectedAssignmentContent] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      const querySnapshot = await getDocs(collection(db, 'assignments'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(data);
    };

    fetchAssignments();
  }, []);

const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values) => {
    setLoadingSubmit(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        studentId: values.studentId.toUpperCase(),
        studentName: values.studentName,
        assignmentId: values.assignmentId,
        code: values.code,
        timestamp: Timestamp.now()
      });
      api.success({
        message: 'Thành công',
        description: 'Nộp bài thành công!',
        placement: 'topRight',
      });
    } catch (err) {
      console.error(err);
      api.error({
        message: 'Lỗi',
        description: 'Đã có lỗi xảy ra khi nộp bài.',
        placement: 'topRight',
      });
    }
    setLoadingSubmit(false);
  };

  const handleAssignmentChange = (value) => {
    setSelectedAssignmentId(value);
    const assignment = assignments.find(a => a.id === value);
    setSelectedAssignmentContent(assignment?.description || assignment?.content || '');
  };

  return (
    
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '3rem 1rem',
      }}
    >
          {contextHolder}
      <Form
        name="student-submit"
        onFinish={onFinish}
        layout="vertical"
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: 600,
          boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
        }}
        initialValues={{
          studentId: '',
          studentName: '',
          assignmentId: '',
          code: '',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Nộp Bài Tập
        </Title>

        <Form.Item
          label="Chọn đề bài"
          name="assignmentId"
          rules={[{ required: true, message: 'Vui lòng chọn đề bài!' }]}
        >
          <Select
            placeholder="-- Chọn đề bài --"
            onChange={handleAssignmentChange}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {assignments.map(a => (
              <Option key={a.id} value={a.id}>
                {a.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedAssignmentContent && (
          <Card
            size="small"
            style={{ marginBottom: '1.5rem', backgroundColor: '#fafafa', borderRadius: '6px' }}
            type="inner"
            title="Nội dung đề bài"
          >
            <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {selectedAssignmentContent}
            </Paragraph>
          </Card>
        )}

        <Form.Item
          label="Mã số sinh viên"
          name="studentId"
          rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên!' }]}
        >
          <Input placeholder="VD: HE123456" onChange={e => e.target.value = e.target.value.toUpperCase()} />
        </Form.Item>

        <Form.Item
          label="Họ tên"
          name="studentName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="VD: Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="Bài giải"
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập mã chương trình!' }]}
        >
          <TextArea
            rows={8}
            placeholder="Viết mã chương trình C vào đây..."
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loadingSubmit}>
            Nộp bài
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default StudentSubmit;
