import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import { TextInput, Button, Avatar } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system"; // Import FileSystem to handle base64 conversion
import { Asset } from "expo-asset";
import * as ImagePicker from "expo-image-picker";

// Update the API_URL to your backend's IP address or localhost URL
const API_URL = "http://172.17.33.130:5000/predict-laptop";

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  company: Yup.string().required("Company is required"),
  type_name: Yup.string().required("Type name is required"),
  ram: Yup.number().required("RAM is required").min(1),
  weight: Yup.number().required("Weight is required").min(0),
  touchscreen: Yup.number().required("Touchscreen is required").min(0),
  lps: Yup.number().required("LPS is required").min(0),
  ppi: Yup.number().required("PPI is required").min(0),
  cpu_brand: Yup.string().required("CPU Brand is required"),
  hdd: Yup.number().required("HDD is required").min(0),
  ssd: Yup.number().required("SSD is required").min(0),
  gpu_brand: Yup.string().required("GPU Brand is required"),
  os: Yup.string().required("Operating System is required"),
});

const LaptopPriceForm = () => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null); // Store base64-encoded image
  const [logoBase64, setLogoBase64] = useState(null); // Store logo base64
 

  useEffect(() => {
    const loadLogo = async () => {
      const logo = Asset.fromModule(require("../assets/images/logo_image.png"));
      await logo.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(logo.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLogoBase64(`data:image/png;base64,${base64}`);
    };
    loadLogo();
  }, []);

  //Image Picker Function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setImage(selectedImageUri);

      // Convert the image to base64
      const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  // Generate and Share PDF Function
  const generateAndSharePDF = async (values) => {
    const currentDate = new Date().toLocaleString();

    if (!logoBase64) {
      Alert.alert("Error", "Logo image not loaded yet.");
      return;
    }

//     const htmlContent = `
//     <html>
//       <body style="margin: 40px; font-family: Arial, sans-serif; text-align: center; border: 2px solid #000;">
//         <img src="${logoBase64}" alt="App Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
//         <h1 style="margin-bottom: 20px;">Laptop Price Prediction Report</h1>
//         <p><strong>Date:</strong> ${currentDate}</p>
//         <hr style="margin-bottom: 20px;" />
//         ${
//           imageBase64
//             ? <img src="${imageBase64}" alt="Laptop Image" style="width: 50%; height: auto; margin-bottom: 20px;" />
//             : ""
//         }
//         <p><strong>Company:</strong> ${values.company}</p>
//         <p><strong>Type Name:</strong> ${values.type_name}</p>
//         <p><strong>RAM:</strong> ${values.ram} GB</p>
//         <p><strong>Weight:</strong> ${values.weight} kg</p>
//         <p><strong>Touchscreen:</strong> ${
//           values.touchscreen ? "Yes" : "No"
//         }</p>
//         <p><strong>LPS:</strong> ${values.lps}</p>
//         <p><strong>PPI:</strong> ${values.ppi}</p>
//         <p><strong>CPU Brand:</strong> ${values.cpu_brand}</p>
//         <p><strong>HDD:</strong> ${values.hdd} GB</p>
//         <p><strong>SSD:</strong> ${values.ssd} GB</p>
//         <p><strong>GPU Brand:</strong> ${values.gpu_brand}</p>
//         <p><strong>Operating System:</strong> ${values.os}</p>
//         <p><strong>Predicted Price:</strong> ₹${predictedPrice}</p>
//       </body>
//     </html>
//   `;
const htmlContent = `
  <html>
    <body style="margin: 40px; font-family: Arial, sans-serif; text-align: center; border: 2px solid #000;">
      <img src="${logoBase64}" alt="App Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
      <h1 style="margin-bottom: 20px;">Laptop Price Prediction Report</h1>
      <p><strong>Date:</strong> ${currentDate}</p>
      <hr style="margin-bottom: 20px;" />
      ${imageBase64 ? `<img src="${imageBase64}" alt="Laptop Image" style="width: 50%; height: auto; margin-bottom: 20px;" />` : ""}
      <p><strong>Company:</strong> ${values.company}</p>
      <p><strong>Type Name:</strong> ${values.type_name}</p>
      <p><strong>RAM:</strong> ${values.ram} GB</p>
      <p><strong>Weight:</strong> ${values.weight} kg</p>
      <p><strong>Touchscreen:</strong> ${values.touchscreen ? "Yes" : "No"}</p>
      <p><strong>LPS:</strong> ${values.lps}</p>
      <p><strong>PPI:</strong> ${values.ppi}</p>
      <p><strong>CPU Brand:</strong> ${values.cpu_brand}</p>
      <p><strong>HDD:</strong> ${values.hdd} GB</p>
      <p><strong>SSD:</strong> ${values.ssd} GB</p>
      <p><strong>GPU Brand:</strong> ${values.gpu_brand}</p>
      <p><strong>Operating System:</strong> ${values.os}</p>
      <p><strong>Predicted Price:</strong> ₹${predictedPrice}</p>
    </body>
  </html>
`;


    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
    }
  };

//   
const handleSubmit = (values, { setSubmitting }) => {
    const formData = {
        company: values.company.trim(),
        type_name: values.type_name.trim(),
        ram: parseInt(values.ram, 10),
        weight: parseFloat(values.weight),
        touchscreen: parseInt(values.touchscreen, 10),
        lps: parseInt(values.lps, 10),
        ppi: parseFloat(values.ppi),
        cpu_brand: values.cpu_brand.trim(),
        hdd: parseInt(values.hdd, 10),
        ssd: parseInt(values.ssd, 10),
        gpu: values.gpu_brand.trim(),
        os: values.os.trim(),
    };

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.predicted_price_inr !== undefined) {
            setPredictedPrice(data.predicted_price_inr.toFixed(2)); // Use INR price
            setErrorMessage(null);
        } else {
            throw new Error(data.error || "Prediction failed, try again.");
        }
    })
    .catch((error) => {
        setErrorMessage("Error predicting price: " + error.message);
    })
    .finally(() => {
        setSubmitting(false);
    });
};


  const handleReset = (resetForm) => {
    resetForm(); // Reset Formik form values
    setPredictedPrice(null); // Reset predicted price state
    setImage(null); // Reset image state
    setImageBase64(null); // Reset base64 image state
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Formik
            initialValues={{
              company: "",
              type_name: "",
              ram: "",
              weight: "",
              touchscreen: "",
              lps: "",
              ppi: "",
              cpu_brand: "",
              hdd: "",
              ssd: "",
              gpu_brand: "",
              os: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              resetForm,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View>
                <Text style={styles.heading}>Laptop Price Prediction</Text>
                <View style={styles.imagePicker}>
                  <Avatar.Image
                    size={100}
                    source={image ? { uri: image } : undefined}
                  />
                  <Button
                    mode="outlined"
                    onPress={pickImage}
                    style={styles.uploadButton}
                  >
                    Upload Laptop Image
                  </Button>
                </View>
                <TextInput
                  label="Company"
                  style={styles.input}
                  onChangeText={handleChange("company")}
                  onBlur={handleBlur("company")}
                  value={values.company}
                  error={touched.company && errors.company}
                />
                {touched.company && errors.company && (
                  <Text style={styles.error}>{errors.company}</Text>
                )}
                <TextInput
                  label="Type Name"
                  style={styles.input}
                  onChangeText={handleChange("type_name")}
                  onBlur={handleBlur("type_name")}
                  value={values.type_name}
                  error={touched.type_name && errors.type_name}
                />
                {touched.type_name && errors.type_name && (
                  <Text style={styles.error}>{errors.type_name}</Text>
                )}
                <TextInput
                  label="RAM (in GB)"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("ram")}
                  onBlur={handleBlur("ram")}
                  value={values.ram}
                  error={touched.ram && errors.ram}
                />
                {touched.ram && errors.ram && (
                  <Text style={styles.error}>{errors.ram}</Text>
                )}
                <TextInput
                  label="Weight (in kg)"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("weight")}
                  onBlur={handleBlur("weight")}
                  value={values.weight}
                  error={touched.weight && errors.weight}
                />
                {touched.weight && errors.weight && (
                  <Text style={styles.error}>{errors.weight}</Text>
                )}
                <TextInput
                  label="Touchscreen (1 for Yes, 0 for No)"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("touchscreen")}
                  onBlur={handleBlur("touchscreen")}
                  value={values.touchscreen}
                  error={touched.touchscreen && errors.touchscreen}
                />
                {touched.touchscreen && errors.touchscreen && (
                  <Text style={styles.error}>{errors.touchscreen}</Text>
                )}
                <TextInput
                  label="LPS"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("lps")}
                  onBlur={handleBlur("lps")}
                  value={values.lps}
                  error={touched.lps && errors.lps}
                />
                {touched.lps && errors.lps && (
                  <Text style={styles.error}>{errors.lps}</Text>
                )}
                <TextInput
                  label="PPI"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("ppi")}
                  onBlur={handleBlur("ppi")}
                  value={values.ppi}
                  error={touched.ppi && errors.ppi}
                />
                {touched.ppi && errors.ppi && (
                  <Text style={styles.error}>{errors.ppi}</Text>
                )}
                <TextInput
                  label="CPU Brand"
                  style={styles.input}
                  onChangeText={handleChange("cpu_brand")}
                  onBlur={handleBlur("cpu_brand")}
                  value={values.cpu_brand}
                  error={touched.cpu_brand && errors.cpu_brand}
                />
                {touched.cpu_brand && errors.cpu_brand && (
                  <Text style={styles.error}>{errors.cpu_brand}</Text>
                )}
                <TextInput
                  label="HDD (in GB)"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("hdd")}
                  onBlur={handleBlur("hdd")}
                  value={values.hdd}
                  error={touched.hdd && errors.hdd}
                />
                {touched.hdd && errors.hdd && (
                  <Text style={styles.error}>{errors.hdd}</Text>
                )}
                <TextInput
                  label="SSD (in GB)"
                  style={styles.input}
                  keyboardType="numeric"
                  onChangeText={handleChange("ssd")}
                  onBlur={handleBlur("ssd")}
                  value={values.ssd}
                  error={touched.ssd && errors.ssd}
                />
                {touched.ssd && errors.ssd && (
                  <Text style={styles.error}>{errors.ssd}</Text>
                )}
                <TextInput
                  label="GPU Brand"
                  style={styles.input}
                  onChangeText={handleChange("gpu_brand")}
                  onBlur={handleBlur("gpu_brand")}
                  value={values.gpu_brand}
                  error={touched.gpu_brand && errors.gpu_brand}
                />
                {touched.gpu_brand && errors.gpu_brand && (
                  <Text style={styles.error}>{errors.gpu_brand}</Text>
                )}
                <TextInput
                  label="Operating System"
                  style={styles.input}
                  onChangeText={handleChange("os")}
                  onBlur={handleBlur("os")}
                  value={values.os}
                  error={touched.os && errors.os}
                />
                {touched.os && errors.os && (
                  <Text style={styles.error}>{errors.os}</Text>
                )}
                {predictedPrice ? (
                  <>
                    <Text style={styles.predictionText}>
                      Predicted Price: ₹{predictedPrice}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => generateAndSharePDF(values)}
                      style={styles.submitButton}
                    >
                      Share PDF
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleReset(resetForm)} // Trigger resetForm and state reset
                      style={styles.submitButton}
                    >
                      Refresh
                    </Button>
                  </>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={styles.submitButton}
                  >
                    {isSubmitting ? "Predicting..." : "Predict Price"}
                  </Button>
                )}
                {errorMessage && (
                  <Text style={styles.error}>{errorMessage}</Text>
                )}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  predictionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  uploadButton: {
    marginTop: 10,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default LaptopPriceForm;