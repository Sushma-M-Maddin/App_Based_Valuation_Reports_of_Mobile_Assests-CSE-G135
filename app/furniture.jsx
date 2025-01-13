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

const API_URL = "http://172.17.33.130:5000/predict_furniture";

const validationSchema = Yup.object().shape({
  furniture_type: Yup.string().required("Furniture type is required"),
  material: Yup.string().required("Material type is required"),
  age: Yup.number()
    .required("Age of furniture is required")
    .min(0, "Age cannot be negative"),
  condition: Yup.string().required("Condition is required"),
});

const FurniturePriceForm = () => {
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
          <h1 style="margin-bottom: 20px;">Furniture Price Prediction Report</h1>
          <p><strong>Date:</strong> ${currentDate}</p>
          <hr style="margin-bottom: 20px;"/>
          ${imageBase64 ? `<img src="${imageBase64}" alt="Furniture Image" style="width: 50%; height: auto; margin-bottom: 20px;" />` : ""}

          <p><strong>Furniture Type:</strong> ${values.furniture_type}</p>
          <p><strong>Material:</strong> ${values.material}</p>
          <p><strong>Age of Furniture:</strong> ${values.age} years</p>
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

    if (!values.furniture_type.trim()) {
      setErrorMessage("Invalid furniture type. Please enter a valid type.");
      setSubmitting(false);
      return;
    }

    const formData = {
      furniture_type: values.furniture_type.trim(),
      material: values.material.trim(),
      age: parseInt(values.age, 10),
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
            furniture_type: "",
            material: "",
            age: "",
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
              <Text style={styles.heading}>Furniture Price Prediction</Text>
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
                  Upload Furniture Image
                </Button>
              </View>
              <TextInput
                label="Furniture Type"
                style={styles.input}
                onChangeText={handleChange("furniture_type")}
                onBlur={handleBlur("furniture_type")}
                value={values.furniture_type}
                error={touched.furniture_type && errors.furniture_type}
              />
              {touched.furniture_type && errors.furniture_type && (
                <Text style={styles.error}>{errors.furniture_type}</Text>
              )}
              <TextInput
                label="Material"
                style={styles.input}
                onChangeText={handleChange("material")}
                onBlur={handleBlur("material")}
                value={values.material}
                error={touched.material && errors.material}
              />
              {touched.material && errors.material && (
                <Text style={styles.error}>{errors.material}</Text>
              )}
              <TextInput
                label="Age of Furniture (in years)"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange("age")}
                onBlur={handleBlur("age")}
                value={values.age}
                error={touched.age && errors.age}
              />
              {touched.age && errors.age && (
                <Text style={styles.error}>{errors.age}</Text>
              )}
              <TextInput
                label="Condition (e.g., New, Good, Old)"
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

export default FurniturePriceForm;
