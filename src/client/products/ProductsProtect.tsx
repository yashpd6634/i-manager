import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/util";
import Products from "./Products";

const ProductsProtect = () => {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const checkPassword = trpc.checkPasswordProduct.useMutation();

  const handlePasswordSubmit = async () => {
    const response = await checkPassword.mutateAsync({ password });
    if (response.success) {
      setOpen(false);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordSubmit();
          }}
        >
          <DialogTitle>
            Enter Password
            <IconButton
              aria-label="close"
              onClick={handleClose}
              style={{ position: "absolute", right: 8, top: 8 }}
            >
              <X />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              helperText={error ? "Incorrect password. Try again." : ""}
            />
          </DialogContent>
          <DialogActions>
            <Button
              type="submit" // Makes this button trigger the form's onSubmit event
              color="primary"
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {!open && <Products />}
    </>
  );
};

export default ProductsProtect;
