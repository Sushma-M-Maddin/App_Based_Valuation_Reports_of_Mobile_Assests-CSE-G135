import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, ScrollView } from "react-native";
import { TextInput, Button, Avatar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

const API_URL = "http://172.17.33.130:5000/predict";

const validationSchema = Yup.object().shape({
  brand: Yup.string().required("Brand is required"),
  model: Yup.string().required("Model is required"),
  year: Yup.number()
    .required("Year is required")
    .min(2000, "Enter a valid year")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  storage: Yup.number().required("Storage capacity is required"),
  condition: Yup.string().required("Condition is required"),
});

const SmartphonePriceForm = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

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

      const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  const generateAndSharePDF = async (values) => {
    const currentDate = new Date().toLocaleString();

    if (!logoBase64) {
      Alert.alert("Error", "Logo image not loaded yet.");
      return;
    }

    const htmlContent = `
      <html>
        <body style="margin: 40px; font-family: Arial, sans-serif; text-align: center; border: 2px solid #000;">
          <img src="${logoBase64}" alt="App Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
          <h1 style="margin-bottom: 20px;">Smartphone Price Prediction Report</h1>
          <p><strong>Date:</strong> ${currentDate}</p>
          <hr style="margin-bottom: 20px;"/>
          ${imageBase64 ? `<img src="${imageBase64}" alt="Smartphone Image" style="width: 50%; height: auto; margin-bottom: 20px;" />` : ""}

          <p><strong>Brand:</strong> ${values.brand}</p>
          <p><strong>Model:</strong> ${values.model}</p>
          <p><strong>Year:</strong> ${values.year}</p>
          <p><strong>Storage:</strong> ${values.storage} GB</p>
          <p><strong>Condition:</strong> ${values.condition}</p>
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

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    if (!values.brand.trim()) {
      setErrorMessage("Invalid brand. Please enter a valid smartphone brand.");
      setSubmitting(false);
      return;
    }

    const formData = {
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: parseInt(values.year, 10),
      storage: parseInt(values.storage, 10),
      condition: values.condition.trim(),
    };

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          setErrorMessage("Unable to fetch prediction. Please check your internet connection or try again later.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.predicted_price !== undefined) {
          setPredictedPrice(data.predicted_price.toFixed(2));
          setErrorMessage(null);
        } else {
          throw new Error(data.error || "Prediction failed, try again.");
        }
      })
      .catch((error) => {
        console.error("Error fetching prediction:", error.message);
        setErrorMessage("Error predicting price: " + error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Formik
          initialValues={{
            brand: "",
            model: "",
            year: "",
            storage: "",
            condition: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            resetForm,
          }) => (
            <View>
              <Text style={styles.heading}>Smartphone Price Prediction</Text>
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
                  Upload Smartphone Image
                </Button>
              </View>
              <TextInput
                label="Brand"
                style={styles.input}
                onChangeText={handleChange("brand")}
                onBlur={handleBlur("brand")}
                value={values.brand}
                error={touched.brand && errors.brand}
              />
              {touched.brand && errors.brand && (
                <Text style={styles.error}>{errors.brand}</Text>
              )}
              <TextInput
                label="Model"
                style={styles.input}
                onChangeText={handleChange("model")}
                onBlur={handleBlur("model")}
                value={values.model}
                error={touched.model && errors.model}
              />
              {touched.model && errors.model && (
                <Text style={styles.error}>{errors.model}</Text>
              )}
              <TextInput
                label="Year"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange("year")}
                onBlur={handleBlur("year")}
                value={values.year}
                error={touched.year && errors.year}
              />
              {touched.year && errors.year && (
                <Text style={styles.error}>{errors.year}</Text>
              )}
              <TextInput
                label="Storage (GB)"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange("storage")}
                onBlur={handleBlur("storage")}
                value={values.storage}
                error={touched.storage && errors.storage}
              />
              {touched.storage && errors.storage && (
                <Text style={styles.error}>{errors.storage}</Text>
              )}
              <TextInput
                label="Condition (e.g., New, Used)"
                style={styles.input}
                onChangeText={handleChange("condition")}
                onBlur={handleBlur("condition")}
                value={values.condition}
                error={touched.condition && errors.condition}
              />
              {touched.condition && errors.condition && (
                <Text style={styles.error}>{errors.condition}</Text>
              )}
              {predictedPrice ? (
                <>
                  <Text style={styles.resultText}>
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
                    onPress={() => {
                      resetForm();
                      setPredictedPrice(null);
                      setImage(null);
                      setImageBase64(null);
                    }}
                    style={styles.submitButton}
                  >
                    Refresh
                  </Button>
                </>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={isSubmitting}
                >
                  Predict Price
                </Button>
              )}
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  uploadButton: {
    marginLeft: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "white",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 20,
  },
  resultText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default SmartphonePriceForm;
