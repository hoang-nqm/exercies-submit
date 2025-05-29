import React, { useEffect, useState } from 'react';
import {
  Select,
  Typography,
  Spin,
  Card,
  Divider,
  Empty,
  Button,
  Tag,
  Popconfirm,
  message as antdMessage,
} from 'antd';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // VS Code dark theme
import { DeleteOutlined } from '@ant-design/icons';

SyntaxHighlighter.registerLanguage('c', c);

const { Title, Text } = Typography;
const { Option } = Select;

function TeacherSubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
   const fetchAssignments = async () => {
    const querySnapshot = await getDocs(collection(db, 'assignments'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAssignments(data);

    if (data.length > 0 && !selectedAssignment) {
      setSelectedAssignment(data[0].id);
    }
  };

  fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoadingSubs(true);

      if (!selectedAssignment) {
        setSubmissions([]);
        setLoadingSubs(false);
        return;
      }

      const q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', selectedAssignment)
      );

      try {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(data);
      } catch (error) {
        console.error('Lỗi khi lấy bài nộp:', error);
        setSubmissions([]);
      }

      setLoadingSubs(false);
    };

    fetchSubmissions();
  }, [selectedAssignment]);

  const handleMark = async (id, result) => {
    try {
      const submissionRef = doc(db, 'submissions', id);
      await updateDoc(submissionRef, { result });
      setSubmissions(prev =>
        prev.map(sub => (sub.id === id ? { ...sub, result } : sub))
      );
      antdMessage.success(`✅ Đã đánh dấu bài là "${result}"`);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      antdMessage.error('❌ Lỗi khi chấm bài.');
    }
  };

  const handleDeleteSubmission = async (id) => {
    try {
      await deleteDoc(doc(db, 'submissions', id));
      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      antdMessage.success('🗑️ Đã xoá bài nộp.');
    } catch (error) {
      console.error('Lỗi khi xoá bài nộp:', error);
      antdMessage.error('❌ Không thể xoá bài nộp.');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 24, backgroundColor: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', color: '#ffffff' }}>📄 Views Answer</Title>

      <Text strong style={{ color: '#ffffff' }}>Chọn đề bài:</Text>
      <Select
        style={{ width: '100%', marginTop: 8, marginBottom: 24 }}
        placeholder="-- Chọn đề bài --"
        value={selectedAssignment || undefined}
        onChange={(value) => setSelectedAssignment(value)}
      >
        {assignments.map((a) => (
          <Option key={a.id} value={a.id}>
            {a.title}
          </Option>
        ))}
      </Select>

      {!selectedAssignment && (
        <Empty description="Vui lòng chọn đề để xem bài nộp." />
      )}

      {loadingSubs && <Spin tip="Đang tải bài nộp..." style={{ display: 'block', textAlign: 'center' }} />}

      {!loadingSubs && selectedAssignment && submissions.length === 0 && (
        <Empty description="Không có bài nộp nào." />
      )}

      <div>
        {submissions.map((sub) => (
          <Card
            key={sub.id}
            style={{ marginBottom: 24, backgroundColor: '#252526', borderColor: '#333' }}
            title={
              <span style={{ color: '#dcdcaa' }}>
                {sub.studentName} ({sub.studentId}){' '}
                <Text type="secondary" style={{ fontSize: 13, color: '#cccccc' }}>
                  – {sub.timestamp?.seconds
                    ? new Date(sub.timestamp.seconds * 1000).toLocaleString()
                    : ''}
                </Text>
              </span>
            }
            extra={
              <Popconfirm
                title="Xác nhận xoá bài nộp này?"
                onConfirm={() => handleDeleteSubmission(sub.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <DeleteOutlined style={{ color: '#f14c4c' }} />
              </Popconfirm>
            }
          >
            <SyntaxHighlighter
              language="c"
              style={vs2015}
              customStyle={{
                borderRadius: '8px',
                padding: '1rem',
                background: '#1e1e1e',
                fontSize: 14
              }}
            >
              {sub.code}
            </SyntaxHighlighter>

            <Divider style={{ borderColor: '#3c3c3c' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                {sub.result === 'pass' && <Tag color="green">✅ Pass</Tag>}
                {sub.result === 'fail' && <Tag color="volcano">❌ Not Pass</Tag>}
                {!sub.result && <Tag color="default">Chưa chấm</Tag>}
              </div>
              <div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleMark(sub.id, 'pass')}
                  style={{ marginRight: 8, backgroundColor: '#0e639c', borderColor: '#0e639c' }}
                >
                  Pass
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleMark(sub.id, 'fail')}
                  style={{ backgroundColor: '#a4262c', borderColor: '#a4262c' }}
                >
                  Not Pass
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TeacherSubmissions;
