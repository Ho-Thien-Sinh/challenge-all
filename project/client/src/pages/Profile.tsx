import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt } from 'react-icons/fa'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const Profile: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-4">
            <FaUser size={40} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <FaEnvelope className="text-gray-400" size={20} />
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <FaCalendarAlt className="text-gray-400" size={20} />
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày tham gia</label>
              <p className="text-gray-900">
                {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${user.email_confirmed_at ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái email</label>
              <p className="text-gray-900">
                {user.email_confirmed_at ? 'Đã xác nhận' : 'Chưa xác nhận'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile