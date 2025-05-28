import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { Form, Input, Button, DatePicker, Typography, message as antdMessage } from 'antd';
const { Title } = Typography;
const { TextArea } = Input;

function CreateAssignment() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!values.title || !values.description) {
      antdMessage.error('Vui lòng nhập đầy đủ tiêu đề và mô tả.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'assignments'), {
        title: values.title,
        description: values.description,
        deadline: values.deadline ? Timestamp.fromDate(values.deadline.toDate()) : null,
        createdAt: Timestamp.now()
      });

      antdMessage.success(`Đề "${values.title}" đã được tạo thành công!`);
    } catch (err) {
      console.error('Lỗi:', err);
      antdMessage.error('Có lỗi xảy ra khi tạo đề.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Tạo Đề Bài Mới</Title>
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ title: '', description: '', deadline: null }}
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề đề bài!' }]}
        >
          <Input placeholder="VD: Bài 1: Tính tổng hai số" />
        </Form.Item>

        <Form.Item
          label="Mô tả bài tập"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập!' }]}
        >
          <TextArea rows={5} placeholder="VD: Viết chương trình C nhập 2 số và in ra tổng của chúng." />
        </Form.Item>

        <Form.Item label="Hạn nộp (tuỳ chọn)" name="deadline">
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Chọn hạn nộp"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Tạo đề
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateAssignment;
