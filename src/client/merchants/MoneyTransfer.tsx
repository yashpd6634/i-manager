import { trpc } from "@/util";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { v4 } from "uuid";

type TransactionFormData = {
  transactionId: string;
  merchantId: string;
  paymentType: string;
  paidToId: string;
  paymentByUPI: number;
  paymentByCheck: number;
  paymentByCash: number;
  accountType: string;
  totalAmount: number;
  description: string;
};

export const MoneyTransfer = ({
  merchantId,
  balance,
  setBalance,
}: {
  merchantId: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    transactionId: v4(),
    merchantId: merchantId,
    paymentType: "Add",
    paidToId: "",
    paymentByUPI: 0,
    paymentByCheck: 0,
    paymentByCash: 0,
    accountType: "None",
    totalAmount: 0,
    description: "",
  });

  const mutation = trpc.paidMoneyTransaction.useMutation({
    onSuccess: () => {
      // Optionally reload data or update state after successful mutation
      setBalance(balance + Number(formData.totalAmount)); // Update the balance locally after adding money
      window.location.reload();
    },
  });

  const {
    data: merchantData,
    error,
    isLoading,
  } = trpc.getMerchantById.useQuery({ merchantId });

  const {
    data: employeeData,
    error: employeeDataError,
    isLoading: isEmployeeLoading,
  } = trpc.getEmployees.useQuery();

  const handleEmployeeChange = (value: { employeeId: string } | null) => {
    console.log(value);
    setFormData((prev) => ({
      ...prev,
      paidToId: value?.employeeId || "",
    }));
  };

  const handleValueChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
    field:
      | "totalAmount"
      | "paymentByUPI"
      | "paymentByCash"
      | "paymentByCheck"
      | "accountType"
      | "description"
  ) => {
    if (field === "accountType" || field === "description") {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
    } else {
      const value = parseFloat(e.target.value) || 0;
      const updatedFormData = {
        ...formData,
        [field]: value,
      };

      updatedFormData.totalAmount =
        updatedFormData.paymentByCash +
        updatedFormData.paymentByCheck +
        updatedFormData.paymentByUPI;
      setFormData((prev) => updatedFormData);
    }
  };

  const handleAddMoney = () => {
    const addAmount = Number(formData.totalAmount);

    console.log(formData.merchantId);

    if (!addAmount) {
      alert("Please enter a valid amount to add.");
      return;
    }

    console.log(`Adding ₹${addAmount} to merchant ${merchantId}`);

    // Call the mutation to add money to the merchant's balance
    mutation.mutate(formData);

    setFormData({
      transactionId: "",
      merchantId: "",
      paymentType: "Add",
      paidToId: "",
      paymentByUPI: 0,
      paymentByCheck: 0,
      paymentByCash: 0,
      accountType: "None",
      totalAmount: 0,
      description: "",
    }); // Reset the input after the transaction
  };

  if (isLoading || isEmployeeLoading) {
    return <div>Loading...</div>;
  }

  if (error || employeeDataError) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingTop: "0.5rem",
      }}
    >
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Money Transactions</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddMoney} sx={{ mt: 2 }}>
            {/* PAYMENT TYPE */}
            <InputLabel id="paymenType">Payment Type</InputLabel>
            <FormControlLabel
              control={
                <Radio
                  checked={formData.paymentType === "Add"}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentType: "Add",
                    }))
                  }
                  value="Add"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "Add" }}
                />
              }
              label="Add"
            />
            <FormControlLabel
              control={
                <Radio
                  checked={formData.paymentType === "Send"}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentType: "Send",
                    }))
                  }
                  value="Send"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "Send" }}
                />
              }
              label="Send"
            />

            {/* MERCHANT NAME */}
            <TextField
              label="Merchant Name"
              name="name"
              value={merchantData?.merchant?.name}
              fullWidth
              disabled
              required
              margin="normal"
            />

            {/* PHONE NUMBER */}
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={merchantData?.merchant?.phoneNumber}
              fullWidth
              disabled
              required
              margin="normal"
            />

            {/* LOCATION */}
            <TextField
              label="Location"
              name="location"
              value={merchantData?.merchant?.location}
              fullWidth
              disabled
              required
              margin="normal"
            />

            {/* Employee Selection */}
            <Autocomplete
              options={employeeData?.employees || []}
              className="my-4"
              getOptionLabel={(option) =>
                `${option.name} (Ph - ${option.phoneNumber})` || ""
              }
              onChange={(event, value) => handleEmployeeChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Paid ${formData.paymentType === "Add" ? "to" : "by"}`}
                  placeholder="Search employees"
                  fullWidth
                  required
                />
              )}
              loading={isEmployeeLoading}
            />

            {/* Payment By UPI */}
            <div className="mt-4">
              <TextField
                label="Payment By UPI"
                value={formData.paymentByUPI}
                onChange={(e) => handleValueChange(e, "paymentByUPI")}
                type="text"
                inputMode="numeric"
                fullWidth
              />
            </div>

            {/* Payment By Cash */}
            <div className="mt-4">
              <TextField
                label="Payment By Cash"
                value={formData.paymentByCash}
                onChange={(e) => handleValueChange(e, "paymentByCash")}
                type="text"
                inputMode="numeric"
                fullWidth
              />
            </div>

            {/* Payment By Check */}
            <div className="mt-4">
              <TextField
                label="Payment By Check"
                value={formData.paymentByCheck}
                onChange={(e) => handleValueChange(e, "paymentByCheck")}
                type="text"
                inputMode="numeric"
                fullWidth
              />
            </div>

            {/* Select Account */}
            <InputLabel className="mt-2" id="billGeneratedBy">
              Account
            </InputLabel>
            <Select
              labelId="billGeneratedBy"
              id="billGeneratedBy"
              className="mb-2"
              value={formData.accountType}
              onChange={(e) => handleValueChange(e, "accountType")}
              label="Account"
              fullWidth
            >
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Firm">Firm</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>

            {/* Total Amount */}
            <div className="mt-4">
              <TextField
                label="Total Amount"
                value={formData.totalAmount}
                onChange={(e) => handleValueChange(e, "totalAmount")}
                type="text"
                inputMode="numeric"
                disabled
                fullWidth
              />
            </div>

            {/* DESCRIPTION */}
            <TextField
              label="Description"
              name="description"
              placeholder="Description"
              onChange={(e) => handleValueChange(e, "description")}
              value={formData.description}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
            />

            {/* ACTION BUTTONS */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                onClick={() => setIsModalOpen(false)}
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
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="contained"
        color="primary"
        style={{ fontSize: "0.65rem" }}
      >
        Money Transfer
      </Button>
    </div>
  );
};
