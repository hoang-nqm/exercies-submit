import React, { useEffect, useState } from 'react';
import { Select, Typography, Spin, Card, Divider, Empty } from 'antd';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('c', c);

const { Title, Text } = Typography;
const { Option } = Select;

function TeacherSubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Load danh sách đề bài
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

  // Load bài nộp theo đề
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoadingSubs(true);

      if (!selectedAssignment) {
        setSubmissions([]);
        setLoadingSubs(false);
        return;
      }


      console.log(selectedAssignment);
      
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

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center' }}>Xem bài nộp theo đề</Title>

      <Text strong>Chọn đề bài:</Text>
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
            style={{ marginBottom: 24 }}
            title={
              <>
                {sub.studentName} ({sub.studentId}){' '}
                <Text type="secondary" style={{ fontSize: 13 }}>
                  – {sub.timestamp?.seconds
                    ? new Date(sub.timestamp.seconds * 1000).toLocaleString()
                    : ''}
                </Text>
              </>
            }
          >
            <SyntaxHighlighter
              language="c"
              style={atomOneLight}
              customStyle={{
                borderRadius: '8px',
                padding: '1rem',
                background: '#f9f9f9'
              }}
            >
              {sub.code}
            </SyntaxHighlighter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TeacherSubmissions;
