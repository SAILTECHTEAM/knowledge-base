# TrackNet
**-- A Deep Learning Network for Tracking High-speed and Tiny Objects in Sports Application**

To Track the tennis ball from broadcast videos in which the ball images are small, blurry, and sometimes with afterimage tracks or even invisible.

The proposed heatmap-based deep learning network is trained to not onlyu recognize the ball image from a single frame but also learn flying patterns from consecutive frames.

| Comparison | TrackNet, Archana (BG sub) |
|------------|----------------------------|
| Challenges | Overlapping (Ball&BG, Ball blocked by player), Shutter Speed (Tailing) |
| Track mode | Flying, Being hit, Bouncing |
| Background | Grass, Clay, Hard court|
| Label | FrameName, Visibility Class, X, Y |

The Trask Aim determined how TrackNet and TSM work and process input differently:

+ **TrackNet**: Its goal is to estimate the instantaneous velocity (max(∂(x, y, t)/∂t) of a specific object. This is a regression task in spatiotemporal coordinates.
+ **TSM**: Its goal is to classify an action (P(action|f(t-k, t+k))). This is a classification task over a temporal window.
+ Thus determined that **TSM** does not need local features in detail to make classification while **TrackNet** needs to preserve to give a specific coordinate. 
+ Reflect to loss function, **TrackNet** used pixel-wise regression loss, directly penalizes spatial error; **TSM** used cross-entropy (CE) loss, standard classification loss, measuring difference between predicted probability distribution over action classes and one-hot encoded ground truth label.

| Feature/Method | TrackNet | TSM |
|----------------|----------|-----|
| Task Aim | $$max(\partial (x, y, t))/ \partial t$$ | $$P(action\|f(t-k. t+k))$$ |
| Channel Mean | Observation of a pixel in time t | Different Feature (Abstract), LLM Context |
| Loss Function | $$\|Heatmap_{pred} - Heatmap_{gt}\| $$ | $$CE(action_{pred}, action_{gt})$$ |

# [TrackNetV1](https://sci-hub.st/10.1109/avss.2019.8909871)

![alt TrackNetV1](figures/TrackNetV1.png?raw=True)

Input: $W \times H \times (\text{3 Frames}(t, t-1, t-2) \times \text{RGB})$

Output: $W \times H \times 1$

![alt TrackNetV1Output](figures/TrackNetV1Output.png?raw=True)

For output (coordinate, intensity) $$L(i, j, k), (0, 0) \le (i, j) \le (639, 359), k \in [0, 255]$$
Probability of depth $$k$$ at $$(i, j)$$
Softmax given by $$P(i, j, k)=\frac{e^{L(i, j, k)}}{\sum_{t=0}^{255}e^{L(i, j, k)}}$$
Binary heatmap $$\rightarrow$$ Circle Hough

Loss function: $$\ H_Q (P)=-\sum Q(i, j, k) log P(i, j, k) \$$, where GT:

$$Q(i, j, k)=
  \begin{cases}
    1 & if G(i, j)=k \\
    0 & otherwise
  \end{cases}
$$

# [TrackNetV2](https://sci-hub.st/10.1109/icpai51961.2020.00023)

![alt TracknetV2](figures/TrackNetV2.png?raw=True)

![alt TrackNetV2Detail](figures/TrackNetV2Detail.png?raw=True)

Key Changes:
+ VGG Based Encoder-Decoder to U-Net Skip connection
  + Less FP, Trajectory jittering
+ Output $$W \times H \times 1 $$ to $$W \times H \times InputFrames$$
  + Better expression with smoother trajectory
  + Forcing continuous position prediction, better handle motion blur
+ Longer warm-up (more stable training)

| V1 | V2 |
|----|----|
| GT Heatmap tends to like Hard Binary | Smoother Gaussian hearmap (Soft label like) |
| Loss (BCE) is unstable to motion blur frame | (weighted BCE) Adjustable $$\sigma$$ based on size / resolution. No longer one picel peak |
| Agressive upsampling at decoder | Better gradual decoder |
| Only 1 Channel (Frame) output | 3 Channel (Frame) output |
| Lack of BG sample, too less FP (Data Imbalance) | Added BG frame, more sensitive FP (More balancing, ball vs. non-ball) |

# [TrackNetV3](https://people.cs.nycu.edu.tw/~yushuen/data/TrackNetV3.pdf)

![alt TrackNetV3](figures/TrackNetV3.png?raw=True)

Key Changes:
+ Added Background Image in Input
+ Mixup is used during training
+ Added (b) Rectification module to rectify track misalignment
  + Aim to fix object overlapping, Visual blocking/hard identify

## Rectification module

Height threshold: For a video frame $$i, f<i<b$$ not detecting shuttlecock, tracking interval $$[f+1, b-1]$$, generate inpainting masks according to: 

$$M_i=
  \begin{cases}
    1 & if p_y^f < \delta, and, p_y^b < \delta \\
    0 & otherwise
  \end{cases}
$$

where $$p_y^f$$ and $$p_y^b$$ represent the position of the shuttlecock at frames $$f$$ and $$b$$, the threshold is controlled by $$\delta , \delta=30$$ pixels. Otherwise if detected, $$M_i=0$$.

## Experiment

For a 13s Video:

| Trial/Model | TrackNetV2 | TrackNetV3 |
|-------------|------------|------------|
| 1st Trial | 14.3s | 12.6s |
| 2nd Trial | 22.0s | 22.0s |
