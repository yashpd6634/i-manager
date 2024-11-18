import { Text, View, Page, Document, StyleSheet } from "@react-pdf/renderer";
import { OrderFormData } from "./TakeOrderModal";

type MerchantData = {
  merchantId: string;
  name: string;
  phoneNumber: string;
  location: string;
  createdAt: Date;
  balance: number;
  updatedAt: Date;
};

const GenerateBill = ({
  orderData,
  merchantData,
}: {
  orderData: OrderFormData;
  merchantData: MerchantData[] | undefined;
}) => {
  console.log("Rendering GenerateBill");
  if (merchantData === undefined) return;

  const { merchantId } = orderData;
  const merchant = merchantData.find(
    (merchant) => merchant.merchantId === merchantId
  );

  const styles = StyleSheet.create({
    page: {
      fontSize: 11,
      paddingTop: 20,
      paddingLeft: 40,
      paddingRight: 40,
      lineHeight: 1.5,
      flexDirection: "column",
    },

    spaceBetween: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#3E3E3E",
    },

    titleContainer: { flexDirection: "row", marginTop: 24 },

    logo: { width: 90 },

    reportTitle: { fontSize: 26, textAlign: "center" },

    addressTitle: { fontSize: 11, fontStyle: "bold" },

    invoice: {
      fontWeight: "bold",
      fontSize: 20,
      marginBottom: 10,
    },

    invoiceNumber: { fontSize: 11, fontWeight: "bold" },

    address: { fontWeight: 400, fontSize: 10 },

    theader: {
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      height: 20,
      backgroundColor: "#DEDEDE",
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },
    theader2: {
      flex: 2,
      borderRightWidth: 0,
      borderBottomWidth: 1,
    },

    tbody: {
      fontSize: 9,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1,
      borderColor: "whitesmoke",
      borderRightWidth: 1,
      borderBottomWidth: 1,
    },

    total: {
      fontSize: 9,
      paddingTop: 4,
      paddingLeft: 7,
      flex: 1.5,
      borderColor: "whitesmoke",
      borderBottomWidth: 1,
    },

    tbody2: { flex: 2, borderRightWidth: 1 },
  });

  const InvoiceTitle = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <Text style={styles.reportTitle}>PM Trade World</Text>
      </View>
    </View>
  );

  const Address = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ marginTop: 5 }}>
          <Text style={styles.addressTitle}>Near rahul sweets, </Text>
          <Text style={styles.addressTitle}>Dongargaon,</Text>
          <Text style={styles.addressTitle}>Rajnandgaon, Chhattisgarh.</Text>
          <Text style={styles.addressTitle}>Contact: 6263957572</Text>
        </View>
        <View>
          <Text style={styles.invoice}>Order Bill </Text>
          <Text style={styles.invoiceNumber}>
            Order number: {orderData.orderId}{" "}
          </Text>
          <Text style={styles.invoiceNumber}>Bill Id: {orderData.billId} </Text>
        </View>
      </View>
    </View>
  );

  const UserAddress = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <View style={{ maxWidth: 200 }}>
          <Text style={styles.addressTitle}>Bill To </Text>
          <Text style={styles.invoiceNumber}>
            Merchant Name: {merchant?.name}{" "}
          </Text>
          <Text style={styles.address}>
            Merchant Location: {merchant?.location}
          </Text>
          <Text style={styles.address}>
            Merchant Phone Number: {merchant?.phoneNumber}
          </Text>
        </View>
        <Text style={styles.addressTitle}>
          Date: {new Date().toLocaleDateString("en-GB")}
        </Text>
      </View>
    </View>
  );

  const TableHead = () => (
    <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
      <View style={[styles.theader, styles.theader2]}>
        <Text style={{ color: "#000", fontSize: 9 }}>Products</Text>
      </View>
      <View style={styles.theader}>
        <Text style={{ color: "#000", fontSize: 9 }}>Price</Text>
      </View>
      <View style={styles.theader}>
        <Text style={{ color: "#000", fontSize: 9 }}>Quantity</Text>
      </View>
      <View style={styles.theader}>
        <Text style={{ color: "#000", fontSize: 9 }}>Amount</Text>
      </View>
    </View>
  );

  const TableBody = () =>
    orderData.products.map((product) => (
      <View key={product.productId}>
        <View style={{ width: "100%", flexDirection: "row" }}>
          <View style={[styles.tbody, styles.tbody2]}>
            <Text>{product.name}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{product.soldPrice} </Text>
          </View>
          <View style={styles.tbody}>
            <Text>{product.quantity}</Text>
          </View>
          <View style={styles.tbody}>
            <Text>{(product.quantity * product.soldPrice).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    ));

  const TableTotal = () => (
    <View style={{ width: "100%", flexDirection: "row" }}>
      <View style={styles.total}>
        <Text></Text>
      </View>
      <View style={styles.total}>
        <Text> </Text>
      </View>
      <View style={styles.tbody}>
        <Text>Total</Text>
      </View>
      <View style={styles.tbody}>
        <Text>
          {orderData.products.reduce(
            (sum, item) => sum + item.soldPrice * item.quantity,
            0
          )}
        </Text>
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceTitle />
        <Address />
        <UserAddress />
        <TableHead />
        <TableBody />
        <TableTotal />
      </Page>
    </Document>
  );
};
export default GenerateBill;
