import React, { useState } from "react";
import Header from "@/components/header";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Switch,
  Typography,
} from "@mui/material";
import { setIsDarkMode } from "@/store/state";
import { useAppDispatch, useAppSelector } from "@/redux";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

const mockSettings: UserSetting[] = [
  { label: "Username", value: "PM Trade World", type: "text" },
  { label: "Email", value: "pm.tradeworld@gmail.com", type: "text" },
  { label: "Notification", value: true, type: "toggle" },
  { label: "Dark Mode", value: false, type: "toggle" },
  { label: "Language", value: "English", type: "text" },
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleToggleChange = (index: number) => {
    const setting = userSettings[index];
    if (setting.label === "Dark Mode") {
      toggleDarkMode();
    } else {
      const settingsCopy = [...userSettings];
      settingsCopy[index].value = !settingsCopy[index].value as boolean;
      setUserSettings(settingsCopy);
    }
  };

  const handleTextChange = (index: number, newValue: string) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index].value = newValue;
    setUserSettings(settingsCopy);
  };

  return (
    <div className="w-full">
      <Header name="User Settings" />
      <TableContainer component={Paper} className="mt-5 shadow-md">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" fontWeight="bold">
                  Setting
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight="bold">
                  Value
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userSettings.map((setting, index) => (
              <TableRow key={setting.label} hover>
                <TableCell>{setting.label}</TableCell>
                <TableCell>
                  {setting.type === "toggle" ? (
                    <Switch
                      checked={
                        setting.label === "Dark Mode"
                          ? isDarkMode
                          : (setting.value as boolean)
                      }
                      onChange={() => handleToggleChange(index)}
                      color="primary"
                    />
                  ) : (
                    <TextField
                      variant="outlined"
                      size="small"
                      value={setting.value as string}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Settings;
