<?php 
    
    class BrandsApi{
        private $connection = null;

        public static function instance(){
            static $instance = null;
            if($instance === null){
                $instance = new BrandsApi();      
            }
            return $instance;
        }
        private function __construct(){
            $host = "wheatley.cs.up.ac.za";
            $passwordP = "SP2ZUCDHYQNAQQKYBZ4XIP7CFRWJEO33";
            $username = "u22492616";
            $this->connection = new mysqli($host, $username, $passwordP);
            if($this->connection->connect_error){
               die("Connection failure: " . $this->connection->connect_error); 
            }else{
                $this->connection->select_db("u22492616");
            }
        }
            
        public function getRandomBrands(){
            $query = "SELECT * FROM Brands ORDER BY RAND() LIMIT 1";
            $statement = $this->connection->prepare($query);
            $statement->execute();
            $result = $statement->get_result();
            $fData = $result->fetch_all(MYSQLI_ASSOC);
            
            $response = array(
                "status" => "success",
                "timestamp" => time(),
                "data" => $fData
            );

            header('Content-type: application/json');
            $finalJson = json_encode($response);

            echo $finalJson;


        }

        public function apiError(){
            $obj = new stdClass();
            $obj->status = "error";
            $obj->timestamp = time();
            $obj->data = "Error. Post parameters are missing";
            header('Content-type: application/json');
            $objJSON = json_encode($obj);
            echo $objJSON;
        }

        public function apiInvalidError(){
            $obj = new stdClass();
            $obj->status = "error";
            $obj->timestamp = time();
            $obj->data = "Error. Post parameters are invalid/misspelt/missing";
            header('Content-type: application/json');
            $objJSON = json_encode($obj);
            echo $objJSON;
        }

        public function __destruct(){
            if($this->connection != null){
                $this->connection->close();
            }
            
        }

       
    }

    

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $getTypeB = true;

    $instance = BrandsApi::instance();

    if(array_key_exists('type', $data)){
        $getType = $data['type'];
        if($getType != "GetRandomBrands"){
            $getTypeB = false;
            $instance->apiInvalidError();    
            die();      
        }else{
            $getTypeB = true;
        }
        
    }else{
        $getTypeB = false;
        $instance->apiError();
        die();
    }

    if($getTypeB == true){
        $instance->getRandomBrands();
    }
    
?>