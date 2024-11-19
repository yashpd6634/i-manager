import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { v4 } from "uuid";
import Header from "@/components/header";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

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
  const initialFormState = {
    employeeId: v4(),
    name: "",
    phoneNumber: "",
    role: "",
    location: "",
    joinedDate: new Date(),
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState); // Reset form data when the modal opens
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "joinedDate" ? new Date(value) : value,
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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Employee</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* EMPLOYEE NAME */}
          <TextField
            label="Employee Name"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            fullWidth
            required
            margin="normal"
          />

          {/* PHONE NUMBER */}
          <TextField
            label="Phone Number"
            name="phoneNumber"
            placeholder="Phone Number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={handleChange}
            value={formData.phoneNumber}
            fullWidth
            required
            margin="normal"
          />

          {/* ROLE */}
          <TextField
            label="Role"
            name="role"
            placeholder="Role"
            onChange={handleChange}
            value={formData.role}
            fullWidth
            required
            margin="normal"
          />

          {/* LOCATION */}
          <TextField
            label="Location"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={formData.location}
            fullWidth
            required
            margin="normal"
          />

          {/* JOINED DATE */}
          <TextField
            label="Joined Date"
            name="joinedDate"
            type="date"
            onChange={handleChange}
            value={formattedJoinedDate}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* ACTION BUTTONS */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="secondary"
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeModal;
