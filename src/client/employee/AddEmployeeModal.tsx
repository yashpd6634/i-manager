import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";

type EmployeeFormData = {
  employeeId: string;
  name: string;
  phoneNumber: string;
  role: string;
  location: string;
  joinedDate: Date;
};

type CreateEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: EmployeeFormData) => void;
};

const CreateEmployeeModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    employeeId: v4(),
    name: "",
    phoneNumber: "",
    role: "",
    location: "",
    joinedDate: new Date(),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formattedJoinedDate = formData.joinedDate
    ? formData.joinedDate.toISOString().split("T")[0]
    : "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Employee" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* EMPLOYEE NAME */}
          <label htmlFor="name" className={labelCssStyles}>
            Employee Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          {/* PRICE */}
          <label htmlFor="phoneNumber" className={labelCssStyles}>
            Phone Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="phoneNumber"
            placeholder="Phone Number"
            onChange={handleChange}
            value={formData.phoneNumber}
            className={inputCssStyles}
            required
          />

          <label htmlFor="role" className={labelCssStyles}>
            Role
          </label>
          <input
            type="text"
            name="role"
            placeholder="Role"
            onChange={handleChange}
            value={formData.role}
            className={inputCssStyles}
            required
          />

          <label htmlFor="location" className={labelCssStyles}>
            Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={formData.location}
            className={inputCssStyles}
            required
          />

          <label htmlFor="joinedDate" className={labelCssStyles}>
            Joined Date
          </label>
          <input
            type="date"
            name="joinedDate"
            placeholder="Joined Date"
            onChange={handleChange}
            value={formattedJoinedDate}
            className={inputCssStyles}
            required
          />

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
